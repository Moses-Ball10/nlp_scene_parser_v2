from pathlib import Path


def analyze_dimensions(standardized_folder_path):
    folder = Path(standardized_folder_path)
    print(f"--- Analyzing Dimensions in: {folder} ---")

    if not folder.exists():
        print("Folder not found.\n")
        return

    txt_files = sorted(folder.rglob("*.txt"))
    if not txt_files:
        print("No valid text files found.\n")
        return

    level_stats = []

    for file_path in txt_files:
        lines = file_path.read_text().splitlines()
        if not lines:
            continue

        widths_in_file = {len(line) for line in lines}
        if len(widths_in_file) != 1:
            widths_str = ", ".join(str(width) for width in sorted(widths_in_file))
            raise ValueError(
                f"Inconsistent row widths in {file_path}: {widths_str}"
            )

        height = len(lines)
        width = len(lines[0])
        level_stats.append((file_path, height, width))

    if not level_stats:
        print("No non-empty text files found.\n")
        return

    heights = [height for _, height, _ in level_stats]
    widths = [width for _, _, width in level_stats]

    tallest_level = max(level_stats, key=lambda item: item[1])
    widest_level = max(level_stats, key=lambda item: item[2])

    print(f"Total Levels Analyzed: {len(level_stats)}")
    print(
        f"Height -> Min: {min(heights)}, Max: {max(heights)}, "
        f"Avg: {sum(heights) / len(heights):.2f}"
    )
    print(
        f"Width  -> Min: {min(widths)}, Max: {max(widths)}, "
        f"Avg: {sum(widths) / len(widths):.2f}"
    )
    print(
        f"Tallest Level: {tallest_level[0].name} "
        f"({tallest_level[1]} rows x {tallest_level[2]} cols)"
    )
    print(
        f"Widest Level:  {widest_level[0].name} "
        f"({widest_level[1]} rows x {widest_level[2]} cols)"
    )
    print()


analyze_dimensions("architect/data/Standardized/LodeRunner")
analyze_dimensions("architect/data/Standardized/SMB1")
analyze_dimensions("architect/data/Standardized/SMB2")
analyze_dimensions("architect/data/Standardized/SMB2japan")
