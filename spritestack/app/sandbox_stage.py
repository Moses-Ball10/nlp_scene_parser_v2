from __future__ import annotations

from PyQt5.QtCore import QRect, Qt, pyqtSignal
from PyQt5.QtGui import QColor, QFont, QFontMetrics, QPainter, QPen, QPixmap
from PyQt5.QtWidgets import QWidget

from app.theme import (
    ACCENT,
    BG_DARK,
    BORDER,
    BORDER_LIGHT,
    CYAN,
    FONT_FAMILY,
    FONT_SIZE,
    GREEN,
    RED,
    TEXT_BRIGHT,
    TEXT_MUTED,
    YELLOW,
)


class SandboxStage(QWidget):
    """
    Chess-board-style level stage for SpriteStack Studio Sandbox.

    The AI scene parser populates this canvas automatically when a response
    arrives. Objects are rendered at the positions and sizes the model
    decided. The user may drag objects afterward to fine-tune placement.

    Coordinate system
    -----------------
    All object positions are normalised floats in [0, 1] relative to the
    stage widget's current pixel dimensions. (0, 0) is top-left.
    """

    object_moved = pyqtSignal(str, float, float)
    object_selected = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._objects: list[dict] = []
        self._selected_id = ""
        self._dragging_id = ""
        self._drag_offset = (0.0, 0.0)
        self._preview_enabled = False
        self._sprite_pixmaps: dict[str, QPixmap] = {}
        self._palette = [ACCENT, GREEN, YELLOW, CYAN, RED]
        self.setMinimumSize(360, 260)
        self.setMouseTracking(True)

    def set_scene(self, objects: list[dict]) -> None:
        normalised = []
        for i, obj in enumerate(objects or []):
            if not isinstance(obj, dict):
                continue
            item = dict(obj)
            item.setdefault("id", f"scene_obj_{i + 1}")
            item.setdefault("label", item.get("name") or item.get("object") or f"Object {i + 1}")
            item["x"] = self._clamp_float(item.get("x"), 0.0, 1.0, 0.5)
            item["y"] = self._clamp_float(item.get("y"), 0.0, 1.0, 0.5)
            item["w"] = self._clamp_float(item.get("w"), 0.01, 1.0, 0.0625)
            item["h"] = self._clamp_float(item.get("h"), 0.01, 1.0, 0.0625)
            normalised.append(item)
        self._objects = normalised
        self._selected_id = ""
        self._dragging_id = ""
        self.update()

    def clear_scene(self) -> None:
        self._objects = []
        self._selected_id = ""
        self._dragging_id = ""
        self.update()

    def set_preview_enabled(self, enabled: bool) -> None:
        self._preview_enabled = bool(enabled)
        self.update()

    def preview_enabled(self) -> bool:
        return self._preview_enabled

    def set_sprite_images(self, images: dict[str, QPixmap]) -> None:
        self._sprite_pixmaps = {
            str(k): v
            for k, v in (images or {}).items()
            if isinstance(v, QPixmap) and not v.isNull()
        }
        self.update()

    def select_object(self, object_id: str) -> None:
        self._selected_id = str(object_id or "")
        self.update()

    def objects(self) -> list[dict]:
        return [dict(o) for o in self._objects]

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, False)
        self._draw_board(p)
        if not self._objects:
            self._draw_empty_state(p)
        else:
            for i, obj in enumerate(self._objects):
                if self._preview_enabled:
                    self._draw_preview_object(p, obj, i)
                else:
                    self._draw_object(p, obj, i)
        p.end()

    def mousePressEvent(self, event):
        if event.button() != Qt.LeftButton:
            return
        for obj in reversed(self._objects):
            rect = self._object_rect(obj)
            if rect.contains(event.pos()):
                self._selected_id = str(obj.get("id", ""))
                self._dragging_id = self._selected_id
                self._drag_offset = (
                    event.x() - rect.x(),
                    event.y() - rect.y(),
                )
                self.object_selected.emit(self._selected_id)
                self.update()
                return
        self._selected_id = ""
        self._dragging_id = ""
        self.update()

    def mouseMoveEvent(self, event):
        if not self._dragging_id:
            return
        obj = self._find_object(self._dragging_id)
        if obj is None:
            return
        w = float(obj.get("w", 0.0625))
        h = float(obj.get("h", 0.0625))
        
        # Calculate target position using snap to 16x16 grid
        cols, rows = 16, 16
        tile_w = max(1.0, self.width() / cols)
        tile_h = max(1.0, self.height() / rows)
        
        px = event.x() - self._drag_offset[0]
        py = event.y() - self._drag_offset[1]
        
        col = round(px / tile_w)
        row = round(py / tile_h)
        
        col = max(0, min(col, cols - 1))
        row = max(0, min(row, rows - 1))
        
        obj["x"] = col / cols
        obj["y"] = row / rows
        self.update()

    def mouseReleaseEvent(self, event):
        if self._dragging_id:
            obj = self._find_object(self._dragging_id)
            if obj is not None:
                self.object_moved.emit(
                    self._dragging_id,
                    float(obj.get("x", 0.0)),
                    float(obj.get("y", 0.0)),
                )
        self._dragging_id = ""

    def _draw_board(self, p: QPainter):
        p.fillRect(self.rect(), QColor(BG_DARK))
        cols, rows = 16, 16
        tile_w = self.width() / cols
        tile_h = self.height() / rows
        
        # Detect active theme from objects
        theme = "default"
        for obj in self._objects:
            t = str(obj.get("scene_type") or "").lower()
            if t and t != "default":
                theme = t
                break

        if theme == "dungeon":
            a = QColor("#1a1a24")
            b = QColor("#14141e")
            grid_color = QColor("#2a2a3a")
        elif theme == "desert":
            a = QColor("#3d3020")
            b = QColor("#342a1a")
            grid_color = QColor("#5a4a30")
        elif theme == "grassland":
            a = QColor("#1a2a1a")
            b = QColor("#162416")
            grid_color = QColor("#2a3a2a")
        else:
            a = QColor("#222234")
            b = QColor("#1a1a2a")
            grid_color = QColor(BORDER)

        for r in range(rows):
            for c in range(cols):
                x = int(c * tile_w)
                y = int(r * tile_h)
                w = int((c + 1) * tile_w) - x
                h = int((r + 1) * tile_h) - y
                p.fillRect(x, y, w, h, a if ((c + r) % 2 == 0) else b)
                
        p.setPen(QPen(grid_color, 1))
        for c in range(cols + 1):
            x = int(c * tile_w)
            p.drawLine(x, 0, x, self.height())
        for r in range(rows + 1):
            y = int(r * tile_h)
            p.drawLine(0, y, self.width(), y)

    def _draw_empty_state(self, p: QPainter):
        inset = 40
        rect = self.rect().adjusted(inset, inset, -inset, -inset)
        p.setPen(QPen(QColor(BORDER_LIGHT), 2, Qt.DashLine))
        p.drawRect(rect)
        p.setPen(QColor(TEXT_BRIGHT))
        f1 = QFont(FONT_FAMILY, 11)
        f1.setBold(True)
        p.setFont(f1)
        center_y = self.height() // 2 - 16
        p.drawText(QRect(0, center_y, self.width(), 22), Qt.AlignCenter, "Stage empty")
        p.setPen(QColor(TEXT_MUTED))
        p.setFont(QFont(FONT_FAMILY, 9))
        p.drawText(
            QRect(0, center_y + 24, self.width(), 20),
            Qt.AlignCenter,
            "Describe a scene above and click Generate Scene",
        )

    def _draw_object(self, p: QPainter, obj: dict, index: int):
        rect = self._object_rect(obj)
        color = self._object_color(obj, index)
        p.setPen(QPen(QColor(BG_DARK), 1))
        p.drawRect(rect.adjusted(1, 1, 1, 1))
        p.setOpacity(0.8)
        p.fillRect(rect, color)
        p.setOpacity(1.0)
        border = QColor(ACCENT) if str(obj.get("id", "")) == self._selected_id else color.lighter(130)
        p.setPen(QPen(border, 2))
        p.drawRect(rect)
        label = str(obj.get("label") or obj.get("name") or "Object")
        p.setFont(QFont(FONT_FAMILY, FONT_SIZE))
        fm = QFontMetrics(p.font())
        label = fm.elidedText(label, Qt.ElideRight, max(8, rect.width() - 8))
        p.setPen(QColor(TEXT_BRIGHT))
        p.drawText(rect.adjusted(4, 0, -4, 0), Qt.AlignCenter, label)

    def _draw_preview_object(self, p: QPainter, obj: dict, index: int):
        rect = self._object_rect(obj)
        color = self._object_color(obj, index)
        selected = str(obj.get("id", "")) == self._selected_id
        if not bool(obj.get("visible", True)):
            p.setOpacity(0.35)

        pixmap = self._sprite_pixmaps.get(str(obj.get("id", "")))
        if pixmap and not pixmap.isNull():
            target = rect
            scaled = pixmap.scaled(
                target.size(),
                Qt.IgnoreAspectRatio,
                Qt.FastTransformation,
            )
            p.drawPixmap(target.x(), target.y(), scaled)
        else:
            p.setOpacity(0.75 if bool(obj.get("visible", True)) else 0.35)
            p.fillRect(rect, color)
            p.setOpacity(1.0)
            self._draw_fallback_mark(p, rect, obj)

        p.setOpacity(1.0)
        border = QColor(ACCENT) if selected else QColor(BORDER_LIGHT)
        p.setPen(QPen(border, 2 if selected else 1))
        p.drawRect(rect)

    def _draw_fallback_mark(self, p: QPainter, rect: QRect, obj: dict):
        label = str(obj.get("label") or obj.get("name") or "?").strip()
        mark = label[:1].upper() if label else "?"
        font = QFont(FONT_FAMILY, max(9, min(18, rect.height() // 3)))
        font.setBold(True)
        p.setFont(font)
        p.setPen(QColor(TEXT_BRIGHT))
        p.drawText(rect, Qt.AlignCenter, mark)

    def _object_rect(self, obj: dict) -> QRect:
        cols, rows = 16, 16
        tile_w = self.width() / cols
        tile_h = self.height() / rows
        
        col = round(float(obj.get("x", 0.0)) * cols)
        row = round(float(obj.get("y", 0.0)) * rows)
        
        wt = round(float(obj.get("w", 0.0625)) * cols)
        ht = round(float(obj.get("h", 0.0625)) * rows)
        wt = max(1, wt)
        ht = max(1, ht)
        
        x = int(col * tile_w)
        y = int(row * tile_h)
        w = int((col + wt) * tile_w) - x
        h = int((row + ht) * tile_h) - y
        return QRect(x, y, w, h)

    def _object_color(self, obj: dict, index: int) -> QColor:
        raw = obj.get("color")
        color = QColor(str(raw)) if raw else QColor()
        if not color.isValid():
            name = str(obj.get("name") or obj.get("label") or "").lower()
            theme = str(obj.get("scene_type") or "default").lower()

            if theme == "dungeon":
                if "solid" in name:
                    color = QColor("#2F4F4F")
                elif "loot" in name:
                    color = QColor("#FFD700")
                elif "enemy" in name:
                    color = QColor("#8B0000")
                elif "climbable" in name:
                    color = QColor("#4A3B32")
                elif "player" in name:
                    color = QColor("#00FFFF")
                else:
                    color = QColor("#5F9EA0")
            elif theme == "desert":
                if "solid" in name:
                    color = QColor("#D2B48C")
                elif "loot" in name:
                    color = QColor("#9370DB")
                elif "enemy" in name:
                    color = QColor("#D35400")
                elif "climbable" in name:
                    color = QColor("#CD853F")
                elif "player" in name:
                    color = QColor("#E0FFFF")
                else:
                    color = QColor("#F4A460")
            else:  # grassland / default
                if "solid" in name:
                    color = QColor("#8B5A2B")
                elif "loot" in name:
                    color = QColor("#FFD700")
                elif "enemy" in name:
                    color = QColor("#FF4500")
                elif "climbable" in name:
                    color = QColor("#32CD32")
                elif "player" in name:
                    color = QColor("#1E90FF")
                else:
                    color = QColor(self._palette[index % len(self._palette)])
        color.setAlpha(204)
        return color

    def _find_object(self, object_id: str) -> dict | None:
        for obj in self._objects:
            if str(obj.get("id", "")) == object_id:
                return obj
        return None

    @staticmethod
    def _clamp_float(value, lo: float, hi: float, default: float) -> float:
        try:
            val = float(value)
        except (TypeError, ValueError):
            val = default
        return max(lo, min(val, hi))
