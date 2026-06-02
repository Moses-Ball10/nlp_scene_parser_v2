from __future__ import annotations

from pathlib import Path

from nlp_parser.model_A.scripts.inference import SpriteStackParser
from nlp_parser.model_B.inference import LevelGenerator
from nlp_parser.shared.scene_format import normalize_scene_json


class PromptToLevelPipeline:
    def __init__(
        self,
        model_a_path: str | Path | None = None,
        model_b_weights_path: str | Path | None = None,
    ):
        root = Path(__file__).resolve().parent
        default_model_a = root / "model_A" / "models" / "SpriteStack_Model_Slim_v2"
        default_model_b = root / "model_B" / "models" / "final_conditional_architect.pth"

        self.parser = SpriteStackParser(str(model_a_path or default_model_a))
        self.generator = LevelGenerator(model_b_weights_path or default_model_b)

    def run(self, prompt: str) -> dict:
        scene_json = self.parser.parse_command(prompt)
        normalized_scene_json = normalize_scene_json(scene_json)
        level_grid = self.generator.generate_from_json(normalized_scene_json)
        return {
            "prompt": prompt,
            "scene_json": normalized_scene_json,
            "level_grid": level_grid,
        }
