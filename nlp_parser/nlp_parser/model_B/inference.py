from __future__ import annotations

import math
from pathlib import Path

import torch
import torch.nn as nn

from nlp_parser.shared.scene_format import normalize_scene_json


class PositionalEncoding2D(nn.Module):
    def __init__(self, d_model: int, max_height: int = 16, max_width: int = 16):
        super().__init__()
        self.row_embed = nn.Embedding(max_height, d_model // 2)
        self.col_embed = nn.Embedding(max_width, d_model // 2)

    def forward(self, seq_len: int, device: torch.device) -> torch.Tensor:
        rows = torch.arange(seq_len, device=device) // 16
        cols = torch.arange(seq_len, device=device) % 16
        row_pos = self.row_embed(rows)
        col_pos = self.col_embed(cols)
        return torch.cat([row_pos, col_pos], dim=-1).unsqueeze(0)


class ConditionalArchitectTransformer(nn.Module):
    def __init__(
        self,
        condition_dim: int = 27,
        vocab_size: int = 6,
        d_model: int = 128,
        nhead: int = 4,
        num_layers: int = 4,
        dim_feedforward: int = 512,
    ):
        super().__init__()
        self.d_model = d_model
        self.condition_proj = nn.Linear(condition_dim, d_model)
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoder = PositionalEncoding2D(d_model)
        encoder_layers = nn.TransformerEncoderLayer(
            d_model, nhead, dim_feedforward, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layers, num_layers)
        self.fc_out = nn.Linear(d_model, vocab_size)

    def generate_custom_mask(self, size: int) -> torch.Tensor:
        mask = (torch.triu(torch.ones(size, size)) == 1).transpose(0, 1)
        mask[:, 0] = True
        return mask.float().masked_fill(mask == 0, float("-inf")).masked_fill(mask == 1, 0.0)

    def forward(self, condition: torch.Tensor, src: torch.Tensor) -> torch.Tensor:
        seq_len = src.size(1)
        cond_emb = self.condition_proj(condition).unsqueeze(1)
        src_emb = self.embedding(src) * math.sqrt(self.d_model)
        src_emb = src_emb + self.pos_encoder(seq_len, src.device)
        combined_src = torch.cat([cond_emb, src_emb], dim=1)
        mask = self.generate_custom_mask(seq_len + 1).to(src.device)
        output = self.transformer(combined_src, mask=mask)
        return self.fc_out(output[:, 1:, :])


class LevelGenerator:
    def __init__(self, weights_path: str | Path | None = None, device: str | None = None):
        self.device = torch.device(device or "cpu")
        self.weights_path = Path(weights_path or Path(__file__).resolve().parent / "models" / "final_conditional_architect.pth")
        if not self.weights_path.exists():
            self.weights_path = Path(__file__).resolve().parent / "models" / "final_conditional_architect.pth"

        self.model = ConditionalArchitectTransformer(condition_dim=27).to(self.device)
        self.model.load_state_dict(torch.load(self.weights_path, map_location=self.device))
        self.model.eval()

    def json_to_blueprint(self, scene_json: dict) -> torch.Tensor:
        normalized = normalize_scene_json(scene_json)
        vector = torch.zeros(27, dtype=torch.float32)

        zone_map = {
            "top-left": 0,
            "top-center": 1,
            "top-right": 2,
            "mid-left": 3,
            "mid-center": 4,
            "mid-right": 5,
            "bot-left": 6,
            "bot-center": 7,
            "bot-right": 8,
        }
        offsets = {"enemy": 0, "loot": 9, "player": 18}

        for entity in normalized.get("entities", []):
            zone_idx = zone_map.get(entity.get("zone", "mid-center"), 4)
            category = entity.get("category", "enemy")
            if category not in offsets:
                continue
            vector[offsets[category] + zone_idx] += float(int(entity.get("count", 1) or 1))

        return vector.unsqueeze(0)

    def generate_level(self, blueprint: torch.Tensor, max_len: int = 256) -> list[list[int]]:
        generated = torch.tensor([[0]], dtype=torch.long).to(self.device)
        blueprint = blueprint.to(self.device)

        with torch.no_grad():
            for _ in range(max_len - 1):
                logits = self.model(blueprint, generated)
                next_token = torch.argmax(logits[:, -1, :], dim=-1).unsqueeze(0)
                generated = torch.cat([generated, next_token], dim=1)

        return generated.view(16, 16).cpu().tolist()

    def generate_from_json(self, scene_json: dict) -> list[list[int]]:
        blueprint = self.json_to_blueprint(scene_json)
        return self.generate_level(blueprint)


def level_to_ascii(grid: list[list[int]]) -> str:
    char_map = {0: "  ", 1: "██", 2: "LL", 3: "EE", 4: "||", 5: "PP"}
    lines = ["-" * 34]
    for row in grid:
        line = "".join(char_map.get(int(cell), str(int(cell))) for cell in row)
        lines.append(f"|{line}|")
    lines.append("-" * 34)
    return "\n".join(lines)
