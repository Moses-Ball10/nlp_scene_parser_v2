import json
import sys

from nlp_parser.model_B.inference import level_to_ascii
from nlp_parser.pipeline import PromptToLevelPipeline


def main() -> int:
    prompt = " ".join(sys.argv[1:]).strip()
    if not prompt:
        print("Usage: python -m nlp_parser.run_pipeline \"your prompt here\"")
        return 1

    pipeline = PromptToLevelPipeline()
    result = pipeline.run(prompt)

    print("Scene JSON:")
    print(json.dumps(result["scene_json"], indent=2))
    print("\n16x16 Level:")
    print(level_to_ascii(result["level_grid"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
