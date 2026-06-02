from nlp_parser.model_B.inference import LevelGenerator, level_to_ascii

# ==========================================
# 4. MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    print("🚀 Initializing Prompt-to-Scene Neural Pipeline...")
    generator = LevelGenerator()

    # THE TEST JSON
    mock_nlp_prompt = {
        "original_text": "Spawn the player on the bottom left, put 2 enemies in the middle right, and hide some loot in the top center.",
        "entities": [
            {"object": "player", "count": 1, "position": "bottom-left"},
            {"object": "enemy", "count": 2, "position": "mid-right"},
            {"object": "loot", "count": 1, "position": "top-center"},
        ],
    }

    print(f"\n🗣️ User Prompt: '{mock_nlp_prompt['original_text']}'")
    print("\n🌉 Translating to Mathematical Blueprint...")
    blueprint_tensor = generator.json_to_blueprint(mock_nlp_prompt)
    print(blueprint_tensor)

    print("🧠 Generating Spatial Geometry (This may take a few seconds on CPU)...")
    final_grid = generator.generate_level(blueprint_tensor)

    print("\n🏁 Final Scene Ready for Unity:")
    print(level_to_ascii(final_grid))
