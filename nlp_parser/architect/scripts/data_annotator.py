import numpy as np
import torch
from pathlib import Path

# VGLC Token Mapping
TOKENS = {
    "enemy": 3,
    "loot": 2,
    "player": 5 
}

def annotate_9_zone_dataset(input_npy_path, output_pt_path):
    print("Initializing 27-Dimension Auto-Annotator...")
    
    try:
        raw_grids = np.load(input_npy_path)
    except FileNotFoundError:
        print("❌ Error: Could not find mario_training_data.npy")
        return

    paired_dataset = []

    for grid in raw_grids:
        # Expanded to 27 dimensions: [9 Enemies] + [9 Loot] + [9 Player]
        condition_vector = np.zeros(27, dtype=np.float32)

        def count_tokens(row_start, row_end, col_start, col_end, token):
            zone = grid[row_start:row_end, col_start:col_end]
            return np.sum(zone == token)
        
        # Dynamically process all entities and map them to their starting index in the array
        entities = [("enemy", 0), ("loot", 9), ("player", 18)]
        
        for entity_name, start_idx in entities:
            token = TOKENS[entity_name]
            
            # Top Row
            condition_vector[start_idx + 0] = count_tokens(0, 5, 0, 5, token)    # Top-Left
            condition_vector[start_idx + 1] = count_tokens(0, 5, 5, 11, token)   # Top-Center
            condition_vector[start_idx + 2] = count_tokens(0, 5, 11, 16, token)  # Top-Right
            
            # Middle Row
            condition_vector[start_idx + 3] = count_tokens(5, 11, 0, 5, token)   # Mid-Left
            condition_vector[start_idx + 4] = count_tokens(5, 11, 5, 11, token)  # Mid-Center
            condition_vector[start_idx + 5] = count_tokens(5, 11, 11, 16, token) # Mid-Right
            
            # Bottom Row
            condition_vector[start_idx + 6] = count_tokens(11, 16, 0, 5, token)  # Bot-Left
            condition_vector[start_idx + 7] = count_tokens(11, 16, 5, 11, token) # Bot-Center
            condition_vector[start_idx + 8] = count_tokens(11, 16, 11, 16, token)# Bot-Right
        
        # Save the pair
        paired_dataset.append({
            "condition": torch.tensor(condition_vector, dtype=torch.float32),
            "target_grid": torch.tensor(grid, dtype=torch.long)
        })

    Path(output_pt_path).parent.mkdir(parents=True, exist_ok=True)
    torch.save(paired_dataset, output_pt_path)
    
    print(f"✅ Successfully annotated {len(paired_dataset)} chunks.")
    print("Vector shape: 27 dimensions.")

if __name__ == "__main__":
    annotate_9_zone_dataset(
        "architect/data/mario_training_data.npy", 
        "architect/data/conditional_mario_data.pt"
    )