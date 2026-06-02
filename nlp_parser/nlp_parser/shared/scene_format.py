from __future__ import annotations

from copy import deepcopy


POSITION_TO_ZONE = {
    "left": "mid-left",
    "left-side": "mid-left",
    "center": "mid-center",
    "right": "mid-right",
    "right-side": "mid-right",
    "top-left": "top-left",
    "top-left-corner": "top-left",
    "top-center": "top-center",
    "top-right": "top-right",
    "top-right-corner": "top-right",
    "mid-left": "mid-left",
    "middle-left": "mid-left",
    "mid-center": "mid-center",
    "middle-center": "mid-center",
    "middle": "mid-center",
    "mid-right": "mid-right",
    "middle-right": "mid-right",
    "bottom-left": "bot-left",
    "bottom-left-corner": "bot-left",
    "bot-left": "bot-left",
    "bottom-center": "bot-center",
    "bot-center": "bot-center",
    "bottom": "bot-center",
    "bottom-floor": "bot-center",
    "floor": "bot-center",
    "ground": "bot-center",
    "bottom-right": "bot-right",
    "bottom-right-corner": "bot-right",
    "bot-right": "bot-right",
}

def normalize_scene_json(scene_json: dict) -> dict:
    """Return a Model B compatible scene description from Model A output."""
    normalized = deepcopy(scene_json)
    entities = normalized.setdefault("entities", [])

    for entity in entities:
        position = str(entity.get("position", "center")).lower().strip()
        obj_name = str(entity.get("object", "enemy")).lower().strip()

        # Support clean matching for position synonyms
        zone = "mid-center"
        for key, z_val in POSITION_TO_ZONE.items():
            if key in position:
                zone = z_val
                break

        # Substring matching for categories
        category = "other"
        if "player" in obj_name or "hero" in obj_name:
            category = "player"
        elif any(w in obj_name for w in ("loot", "coin", "gem", "treasure", "chest", "item", "lo-ot")):
            category = "loot"
        elif any(w in obj_name for w in ("enemy", "skeleton", "monster", "dragon", "guard")):
            category = "enemy"

        entity["position"] = position
        entity["zone"] = zone
        entity["category"] = category
        entity["count"] = int(entity.get("count", 1) or 1)

    # Extract theme based on raw_text keywords
    raw_text = str(normalized.get("scene_metadata", {}).get("raw_text", "")).lower()
    theme = "default"
    if any(w in raw_text for w in ("dungeon", "cave", "castle")):
        theme = "dungeon"
    elif any(w in raw_text for w in ("desert", "sand")):
        theme = "desert"
    elif any(w in raw_text for w in ("grassland", "jungle", "forest", "green")):
        theme = "grassland"
    
    normalized.setdefault("scene_metadata", {})["global_theme"] = theme

    return normalized

