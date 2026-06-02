from pathlib import Path

class VGLCChunker:
    def __init__(self, target_height=16, window_width=16, stride=8):
        self.target_height = target_height
        self.window_width = window_width
        self.stride = stride

    def pad_height(self, lines):
        """Pads the top of the level with '0' (Air) until it reaches target_height."""
        current_height = len(lines)
        if current_height < self.target_height:
            padding_needed = self.target_height - current_height
            # Create strings of '0' matching the width of the level
            level_width = len(lines[0])
            padding = ["0" * level_width for _ in range(padding_needed)]
            # Add padding to the TOP (sky)
            return padding + lines
        elif current_height > self.target_height:
            # If a level is somehow taller, we crop from the top (sky)
            return lines[-self.target_height:]
        return lines

    def chunk_level(self, file_path, output_dir):
        """Pads a level, slices it horizontally, and saves the chunks."""
        lines = file_path.read_text().splitlines()
        
        # 1. Pad the height
        padded_lines = self.pad_height(lines)
        level_width = len(padded_lines[0])
        
        # 2. Sliding Window for width
        chunk_count = 0
        for start_col in range(0, level_width - self.window_width + 1, self.stride):
            end_col = start_col + self.window_width
            
            chunk_lines = []
            for row in padded_lines:
                chunk_lines.append(row[start_col:end_col])
                
            # Save the chunk
            chunk_name = f"{file_path.stem}_chunk{chunk_count:03d}.txt"
            output_file = output_dir / chunk_name
            output_file.write_text("\n".join(chunk_lines) + "\n")
            
            chunk_count += 1
            
        return chunk_count

    def process_all(self, standardized_dirs, output_root):
        target_root = Path(output_root)
        target_root.mkdir(parents=True, exist_ok=True)
        
        total_chunks = 0
        for s_dir in standardized_dirs:
            source_dir = Path(s_dir)
            if not source_dir.exists():
                print(f"Skipping {s_dir} - not found.")
                continue
                
            for file_path in source_dir.rglob("*.txt"):
                chunks_made = self.chunk_level(file_path, target_root)
                total_chunks += chunks_made
                
        print(f"✅ Success! Generated {total_chunks} perfectly uniform {self.window_width}x{self.target_height} chunks.")

# --- Execution ---
chunker = VGLCChunker(target_height=16, window_width=16, stride=8)

# We are combining all standardized Mario games into one big training folder
mario_folders = [
    "architect/data/Standardized/SMB1",
    "architect/data/Standardized/SMB2",
    "architect/data/Standardized/SMB2japan"
]

chunker.process_all(mario_folders, "architect/data/Training_Chunks/Mario_16x16")