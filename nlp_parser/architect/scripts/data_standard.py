from pathlib import Path


class VGLCStandardizer:
    def __init__(self):
        # 0: Air, 1: Solid, 2: Loot, 3: Enemy, 4: Climbable, 5: Player
        self.universal_map = {
            "lode_runner": {
                "B": "1",
                "b": "1",
                ".": "0",
                "-": "4",
                "#": "4",
                "G": "2",
                "E": "3",
                "M": "5",
            },
            "super_mario_bros": {
                "X": "1",
                "S": "1",
                "#": "1",
                "B": "1",
                "b": "1",
                "<": "1",
                ">": "1",
                "[": "1",
                "]": "1",
                "&": "1",
                "-": "0",
                " ": "0",
                "E": "3",
                "g": "3",
                "k": "3",
                "?": "2",
                "Q": "2",
                "o": "2",
                "M": "5",
            },
            "smb2japan": {
                "X": "1",
                "S": "1",
                "#": "1",
                "B": "1",
                "b": "1",
                "<": "1",
                ">": "1",
                "[": "1",
                "]": "1",
                "&": "1",
                "-": "0",
                " ": "0",
                "E": "3",
                "g": "3",
                "k": "3",
                "?": "2",
                "Q": "2",
                "o": "2",
                "M": "5",
            },
            "smb2": {
                "#": "1",
                "B": "1",
                "P": "1",
                "p": "1",
                "-": "0",
                ".": "0",
                "e": "3",
                "g": "3",
                "?": "2",
                "c": "1",
                "M": "5",
            },
        }

    def standardize_line(self, line, game_type):
        """Convert one ASCII row into the universal token row."""
        mapping = self.universal_map[game_type]
        stripped_line = line.rstrip("\n\r")
        unknown_tiles = sorted({char for char in stripped_line if char not in mapping})

        if unknown_tiles:
            joined = ", ".join(repr(tile) for tile in unknown_tiles)
            raise ValueError(f"Unknown tile(s) for {game_type}: {joined}")

        return "".join(mapping[char] for char in stripped_line)

    def process_folder(self, input_path, output_path, game_type, recursive=True):
        """
        Read .txt files and save standardized versions.

        When recursive=True, nested folders such as SMB2/Processed/WithEnemies
        and SMB2/Processed/NoEnemies are preserved in the output structure.
        """
        source_root = Path(input_path)
        target_root = Path(output_path)

        if game_type not in self.universal_map:
            raise ValueError(f"Unsupported game_type: {game_type}")

        if not source_root.exists():
            raise FileNotFoundError(f"Input path not found: {source_root}")

        txt_files = sorted(source_root.rglob("*.txt") if recursive else source_root.glob("*.txt"))

        if not txt_files:
            raise FileNotFoundError(f"No .txt files found in: {source_root}")

        processed_count = 0
        for file_path in txt_files:
            lines = file_path.read_text().splitlines()
            standardized_content = [self.standardize_line(line, game_type) for line in lines]

            relative_parent = file_path.parent.relative_to(source_root)
            output_dir = target_root / relative_parent
            output_dir.mkdir(parents=True, exist_ok=True)

            output_file = output_dir / f"std_{file_path.name}"
            output_file.write_text("\n".join(standardized_content) + "\n")
            processed_count += 1

        print(f"Processed {processed_count} file(s) for {game_type}.")


# --- Example usage ---
standardizer = VGLCStandardizer()

# standardizer.process_folder(
#     "architect/data/TheVGLC-master/Lode Runner/Processed",
#     "architect/data/Standardized/LodeRunner",
#     "lode_runner",
# )
# #
# standardizer.process_folder(
#     "architect/data/TheVGLC-master/Super Mario Bros/Processed",
#     "architect/data/Standardized/SMB1",
#     "super_mario_bros",
# )

# standardizer.process_folder(
#     "architect/data/TheVGLC-master/Super Mario Bros 2/Processed/WithEnemies",
#     "architect/data/Standardized/SMB2",
#     "smb2",
# )

# standardizer.process_folder(
#     "architect/data/TheVGLC-master/Super Mario Bros 2 (Japan)/Processed",
#     "architect/data/Standardized/SMB2japan",
#     "smb2japan",
# )
