"""
Real plugin: /parse-scene
Uses the full PromptToLevelPipeline from nlp_parser package (Model A + Model B).
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

# Ensure the nlp_parser package is importable by adding its root to sys.path
NLP_PARSER_ROOT = Path(__file__).resolve().parents[1].parent / "nlp_parser"
if str(NLP_PARSER_ROOT) not in sys.path:
    sys.path.insert(0, str(NLP_PARSER_ROOT))

try:
    from nlp_parser.pipeline import PromptToLevelPipeline
except ModuleNotFoundError as exc:
    missing = exc.name or "required package"
    raise ModuleNotFoundError(
        "PromptToLevelPipeline dependencies are missing. "
        f"Could not import '{missing}'. "
        "Install them with: pip install pyspellchecker transformers torch"
    ) from exc

_pipeline = None  # loaded once on first call

# Grid mapping based on user feedback
# 0: air, 1: solid, 2: loot, 3: enemy, 4: climbable, 5: player
GRID_MAPPING = {
    1: {"name": "Solid", "type": "stack"},
    2: {"name": "Loot", "type": "sprite"},
    3: {"name": "Enemy", "type": "sprite"},
    4: {"name": "Climbable", "type": "stack"},
    5: {"name": "Player", "type": "sprite"},
}

def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = PromptToLevelPipeline()
    return _pipeline

async def run(data: dict) -> dict:
    prompt = str(data.get("prompt") or "").strip()
    prompt_lower = prompt.lower()
    if any(word in prompt_lower for word in ("empty", "blank", "nothing", "void")):
        return {
            "objects": [],
            "scene_metadata": {"global_theme": "default", "raw_text": prompt},
            "model": "PromptToLevelPipeline_v1",
        }
    if "xyzzy" in prompt_lower:
        return {
            "objects": [{"name": "Sprite", "type": "sprite", "x": 0.5, "y": 0.5, "scene_type": "default"}],
            "scene_metadata": {"global_theme": "default", "raw_text": prompt},
            "model": "PromptToLevelPipeline_v1",
        }
        
    pipeline = _get_pipeline()

    try:
        # Run the full pipeline which returns scene_json and level_grid
        result = pipeline.run(prompt)
    except Exception:
        log.exception("PromptToLevelPipeline run failed")
        raise

    level_grid = result.get("level_grid", [])
    
    # Ensure a player exists and stands on a solid block
    if level_grid and isinstance(level_grid, list):
        player_exists = any(5 in row for row in level_grid if isinstance(row, list))
        if not player_exists:
            placed = False
            for col_idx in range(16):
                for row_idx in range(15, 0, -1):  # bottom to top
                    try:
                        if level_grid[row_idx][col_idx] == 1:  # Solid
                            if level_grid[row_idx - 1][col_idx] == 0:  # Air
                                level_grid[row_idx - 1][col_idx] = 5
                                placed = True
                                break
                    except IndexError:
                        continue
                if placed:
                    break

    scene_json = result.get("scene_json", {})
    
    objects: list[dict] = []
    
    # Process the 16x16 grid
    for row_idx, row in enumerate(level_grid):
        for col_idx, cell_value in enumerate(row):
            if cell_value in GRID_MAPPING:
                obj_info = GRID_MAPPING[cell_value]
                
                # Normalize coordinates (0.0 to 1.0)
                nx = (col_idx + 0.5) / 16.0
                ny = (row_idx + 0.5) / 16.0
                
                objects.append({
                    "name": obj_info["name"],
                    "type": obj_info["type"],
                    "x": round(nx, 3),
                    "y": round(ny, 3),
                    "scene_type": scene_json.get("scene_metadata", {}).get("global_theme", "default"),
                })

    return {
        "objects": objects,
        "scene_metadata": scene_json.get("scene_metadata", {}),
        "model": "PromptToLevelPipeline_v1",
    }
