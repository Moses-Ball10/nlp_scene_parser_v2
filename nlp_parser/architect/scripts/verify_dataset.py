import torch
import random

def verify_dataset(pt_path, num_samples=3):
    print(f"🔍 Loading dataset from: {pt_path}")
    
    try:
        dataset = torch.load(pt_path)
    except FileNotFoundError:
        print(f"❌ Error: Could not find {pt_path}")
        return

    print(f"✅ Successfully loaded {len(dataset)} paired examples.\n")
    
    # 9-Zone mapping for human readability
    zones = [
        "Top-Left", "Top-Center", "Top-Right",
        "Mid-Left", "Mid-Center", "Mid-Right",
        "Bot-Left", "Bot-Center", "Bot-Right"
    ]
    
    # ASCII visualizer mapping
    char_map = {0: '  ', 1: '██', 2: 'LL', 3: 'EE', 4: '||', 5: 'PP'}

    # Pick random samples to inspect
    samples = random.sample(dataset, num_samples)

    for i, sample in enumerate(samples):
        print("=" * 40)
        print(f"🧩 INSPECTING CHUNK #{i + 1}")
        print("=" * 40)
        
        vector = sample["condition"].numpy()
        grid = sample["target_grid"].numpy()
        
        # 1. Translate the Vector
        print("📋 THE BLUEPRINT (Vector Translation):")
        has_entities = False
        
        # Check Enemies (Indices 0-8)
        for z in range(9):
            if vector[z] > 0:
                print(f"  -> {int(vector[z])} Enemy (EE) in {zones[z]}")
                has_entities = True
                
        # Check Loot (Indices 9-17)
        for z in range(9, 18):
            if vector[z] > 0:
                print(f"  -> {int(vector[z])} Loot (LL) in {zones[z-9]}")
                has_entities = True
                
        # Check Player (Indices 18-26)
        for z in range(18, 27):
            if vector[z] > 0:
                print(f"  -> Player (PP) located in {zones[z-18]}")
                has_entities = True
                
        if not has_entities:
            print("  -> Empty Chunk (No Enemies, Loot, or Player)")

        # 2. Print the Grid
        print("\n🧱 THE TARGET GRID (ASCII):")
        print("-" * 34)
        for row in grid:
            line = "".join([char_map.get(cell, str(cell)) for cell in row])
            print(f"|{line}|")
        print("-" * 34)
        print("\n")

if __name__ == "__main__":
    verify_dataset("architect/data/conditional_mario_data.pt")