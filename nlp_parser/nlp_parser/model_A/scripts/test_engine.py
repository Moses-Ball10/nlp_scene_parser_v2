import json
from nlp_parser.pipeline import PromptToLevelPipeline

# 1. Setup
pipeline = PromptToLevelPipeline()

def run_test(command):
    """Helper to run a command and print formatted results."""
    print(f"\n📝 Testing: '{command}'")
    result = pipeline.run(command)
    print("🚀 Chained Pipeline Output:")
    print(json.dumps(result["scene_json"], indent=4))
    print("🧱 16x16 Level Grid:")
    for row in result["level_grid"]:
        print(row)
    print("-" * 30)

# 3. Clean Test Suite
if __name__ == "__main__":
    print("\n--- SPRITESTACK AI TEST SUITE ---")

    # Test 1: Standard command
    run_test(
        "In a lava cave, spawn three giant red fire dragon at the center and 2 skeleton on the left"
    )
