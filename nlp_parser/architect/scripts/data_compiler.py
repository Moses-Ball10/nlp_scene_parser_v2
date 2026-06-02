import os
import numpy as np
from pathlib import Path

def compile_dataset(chunks_folder, output_file):
    print(f"Scanning for chunks in: {chunks_folder}")
    
    chunk_dir = Path(chunks_folder)
    if not chunk_dir.exists():
        print("Error: Could not find the chunks directory.")
        return

    all_chunks = []
    file_list = list(chunk_dir.glob("*.txt"))
    
    print(f"Found {len(file_list)} files. Compiling matrices...")
    
    for filepath in file_list:
        with open(filepath, 'r') as f:
            lines = [line.rstrip('\n\r') for line in f.readlines()]
            
        # Skip any malformed chunks
        if len(lines) != 16:
            continue
            
        # Convert the string grid into a 2D integer array
        try:
            matrix = [[int(char) for char in line] for line in lines]
            all_chunks.append(matrix)
        except ValueError:
            print(f"Skipping {filepath} due to invalid characters.")
            continue

    # Convert the python list to a highly optimized NumPy array
    dataset_array = np.array(all_chunks, dtype=np.int8)
    
    print(f"Dataset compiled! Shape: {dataset_array.shape}")
    
    # Save the array to a binary file
    np.save(output_file, dataset_array)
    print(f"Successfully saved to {output_file}")

if __name__ == "__main__":
    # Adjust these paths if your terminal is running from a different root
    input_folder = "architect/data/Training_Chunks/Mario_16x16"
    output_filename = "architect/data/mario_training_data.npy"
    
    compile_dataset(input_folder, output_filename)