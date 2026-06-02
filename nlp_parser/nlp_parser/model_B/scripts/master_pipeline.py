import json

from nlp_parser.model_B.inference import level_to_ascii
from nlp_parser.pipeline import PromptToLevelPipeline


def main() -> None:
    pipeline = PromptToLevelPipeline()
    prompt = (
        "In a lava cave, spawn three giant red fire dragon at the center "
        "and 2 skeleton on the left"
    )

    result = pipeline.run(prompt)

    print("🗣️ User Prompt:")
    print(result["prompt"])
    print("\n🚀 Scene JSON:")
    print(json.dumps(result["scene_json"], indent=4))
    print("\n🏁 Final 16x16 Level:")
    print(level_to_ascii(result["level_grid"]))


if __name__ == "__main__":
    main()
