# SpriteStack Studio — Graduation Project Report (Draft)

**Institution:** _[University / School Name]_  
**Department:** _[Department Name]_  
**Academic Year:** 2025–2026  
**Project Type:** End-of-study project (PFE)  
**Report Version:** v0.1 (Draft for soutenance preparation)

---

## Title

**SpriteStack Studio: An Offline AI-Assisted Pixel Art Editor and Sprite Stacking Pipeline**

---

## Team Members

> Replace the placeholders below with official names exactly as required by your department before PDF export.

| Full Name | Role in Project | Main Contributions |
|---|---|---|
| _[Member 1]_ | Project Lead / App Integration | Desktop app architecture, UI integration, final packaging |
| _[Member 2]_ | NLP & Parsing Engineer | Scene parser dataset/training/inference integration |
| _[Member 3]_ | Vision & Animation Engineer | Frame interpolation (tweening) model integration |
| _[Member 4]_ | Generative AI Engineer | Pixel sprite generation pipeline and prompt conditioning |
| _[Supervisor Name]_ | Academic Supervisor | Methodology guidance and evaluation |

---

## Abstract

This project presents **SpriteStack Studio**, a desktop application for pixel-art creation, layer-based sprite stacking, and AI-assisted content generation, with a local FastAPI backend. The system is designed for **offline operation**, enabling model inference without internet access during demonstration and evaluation.

The platform combines four AI modules: scene parsing (NLP), speech-to-text (ASR), keyframe interpolation (tweening), and text-to-sprite generation. The implemented architecture uses plugin-based model routing with deterministic fallback modules for reliability. Results show strong integration maturity for parser, tweening, and generation paths, while the speech pipeline remains in simulation mode in the current codebase snapshot.

---

## Keywords

Pixel Art, Sprite Stacking, FastAPI, DistilBERT, Stable Diffusion, RIFE, Offline AI, Human-Computer Interaction

---

## 1. Introduction

### 1.1 Context

Modern indie game pipelines require rapid generation of sprite assets, scene prototyping, and animation iteration. Traditional manual workflows are time-consuming, especially for small teams.

### 1.2 Problem Statement

How can we build a single desktop tool that supports:
1. Pixel-art drawing and layer stacking,
2. AI-assisted scene interpretation from natural language,
3. AI-assisted frame interpolation and sprite generation,
4. Fully offline inference for academic and production constraints?

### 1.3 Objectives

1. Deliver a stable desktop editor with layer/timeline workflows.
2. Provide local API endpoints for AI tasks.
3. Integrate multiple model families under one consistent contract.
4. Enforce offline readiness and graceful fallback behavior.

### 1.4 Contributions

1. Unified desktop + local AI backend integration.
2. Plugin registry architecture with automatic fallback.
3. AI module specialization by task (NLP, generation, interpolation, ASR pathway).
4. Practical deployment strategy separating source code from heavy model artifacts.

---

## 2. System Overview and Architecture

### 2.1 High-Level Architecture

The solution is split into two repositories:

1. **App repository (`spritestack`)**: desktop editor, rendering, timeline, project system, export pipeline.
2. **API repository (`spritestack-api`)**: local FastAPI server exposing AI endpoints.

### 2.2 Backend Design

The backend uses:

1. **Plugin registry** for real model modules when local model files are present.
2. **Fallback fake plugins** for deterministic behavior when real models are unavailable.
3. **Single localhost server** (`127.0.0.1:8000`) for all AI routes.

### 2.3 Implemented Endpoint Set

1. `/parse-scene`
2. `/transcribe`
3. `/generate-sprite`
4. `/inpaint-region`
5. `/chat`
6. `/tween-frames`
7. `/health`

---

## 3. Methodology

### 3.1 Development Approach

An iterative approach was used:

1. Build functional desktop foundation.
2. Define endpoint contracts between app and API.
3. Integrate real models incrementally.
4. Keep fake-model fallbacks for robustness and testing.

### 3.2 Evaluation Logic

Each model is evaluated under:

1. **Functional correctness** (valid output schema),
2. **Qualitative visual/semantic quality**,
3. **Latency constraints for demo flow**,
4. **Offline execution constraints**.

---

## 4. AI Models (Architecture, Training, and Results)

## 4.1 NLP Scene Parser — `SpriteStack_NER_v1`

### 4.1.1 Purpose

Convert free-form text prompts into structured scene entities and object placements.

### 4.1.2 Model Architecture

1. Base model: **DistilBERT** (`distilbert-base-uncased`) with token-classification head.
2. Label schema: `O`, `B-OBJECT`, `B-POSITION`, `B-SCENE_TYPE`, `B-COUNT`.
3. Inference post-processing:
   - spelling normalization,
   - token glue for multi-word entities,
   - count normalization,
   - position-to-coordinate mapping.

### 4.1.3 Training Configuration (from project notebook run)

1. Train/validation split: **80/20**.
2. Effective split shown in logs: **4000 train / 1000 validation** samples.
3. Epochs: **5**.
4. Learning rate: **2e-5**.
5. Batch size: **16**.
6. Weight decay: **0.01**.
7. Metric suite: precision, recall, F1, accuracy (seqeval).

### 4.1.4 Training Results

| Epoch | Training Loss | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 0.003726 | 0.001962 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 2 | 0.001797 | 0.000970 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 3 | 0.001346 | 0.000696 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 4 | 0.001121 | 0.000590 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 5 | 0.001061 | 0.000560 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

### 4.1.5 Interpretation

The near-perfect metrics indicate very strong fit on the available split, but also suggest the need for stronger out-of-distribution validation to rule out dataset simplicity/overfitting.

---

## 4.2 Speech-to-Text Module — Whisper Pathway

### 4.2.1 Purpose

Convert uploaded WAV microphone input into text prompts for scene parsing.

### 4.2.2 Target Architecture

Whisper is an encoder-decoder Transformer ASR model operating on log-Mel spectrogram inputs.

### 4.2.3 Current Implementation Status

In the current codebase snapshot, `/transcribe` is served by a **deterministic fake plugin** returning plausible transcripts for integration testing.

### 4.2.4 Training and Results

1. Fine-tuning pipeline is not yet committed in the active API implementation.
2. Quantitative ASR metrics (e.g., WER) are therefore **pending for final version**.

### 4.2.5 Planned Final Validation

1. WER on a representative voice test set.
2. End-to-end latency from audio upload to parser-ready text.
3. Offline run verification (no remote calls).

---

## 4.3 Pixel Art Generation — Stable Diffusion Pipeline

### 4.3.1 Purpose

Generate prompt-conditioned sprite imagery and return API-compatible hex RGBA output.

### 4.3.2 Model Architecture

Real plugin is based on **Stable Diffusion 1.5-style latent diffusion**:

1. Text encoder (CLIP-like),
2. Latent U-Net denoiser,
3. VAE decoder to image space.

Model reference in code: local `pixel-art-model` loaded via `StableDiffusionPipeline` with `local_files_only=True`.

### 4.3.3 Inference Configuration

1. Generation resolution: **512×512**.
2. Inference steps: **40**.
3. Guidance scale: **9.0**.
4. Fixed seed for reproducibility in current plugin (`42`).
5. Final downscaling and hex conversion for app ingestion.

### 4.3.4 Training and Results

1. No project-side fine-tuning script is currently included for this model.
2. Quantitative generation benchmarks (FID/CLIP-score/user study) are not yet logged in the repository.
3. Current validation is functional/qualitative through endpoint outputs and app rendering.

---

## 4.4 Keyframe Tweening — `Pixel_RIFE_RGBA_v1`

### 4.4.1 Purpose

Given two frames (`F0`, `F2`), predict an intermediate frame (`F1`) while preserving pixel-art edges and alpha consistency.

### 4.4.2 Model Architecture

The integrated package uses a RIFE/IFNet-style multi-scale flow estimator adapted for RGBA:

1. Coarse-to-fine IFBlocks,
2. Bidirectional warping,
3. Mask-based blending,
4. 4-channel adaptation to include alpha in motion estimation.

### 4.4.3 Training Setup (documented in integration report)

1. Dataset scale: **7,300 supervised triplets**.
2. Supervision tuple: `(F0, F1, F2)` with true middle frame.
3. Loss design: **L1 + Laplacian edge loss**.
4. Data domain: sprite animations with diverse motions.

### 4.4.4 Deployment Behavior in API

1. Expects equal-size RGBA frames.
2. Enforces 64×64 path for real model call.
3. Returns confidence (0.95 on successful real inference).
4. Falls back to fake plugin for invalid-size or test-mode requests.

### 4.4.5 Results Status

1. Package-level report describes training rationale and dataset scope.
2. Repository currently contains no consolidated benchmark table (e.g., SSIM/PSNR) for the integrated checkpoint.
3. Functional smoke-test contract is documented (shape/type checks).

---

## 5. Integration and Deployment

### 5.1 App–API Integration Contract

The desktop app communicates with FastAPI through localhost JSON/form-data endpoints. Response schemas are normalized so the editor can ingest outputs directly.

### 5.2 Offline Constraint

Model loading is local-path based, and generation plugin explicitly uses offline-only loading mode. This supports jury/demo environments with restricted connectivity.

### 5.3 Repository and Model Management

To keep repositories lightweight and push-safe:

1. App repository excludes API and local training/model folders.
2. API repository excludes heavy model directories (`/models/`) and checkpoints.
3. Model setup is documented separately for reproducible local deployment.

---

## 6. Discussion

### 6.1 Strengths

1. Robust modular architecture with fallback behavior.
2. Clear endpoint contracts for scalable integration.
3. Practical offline-first design aligned with academic demo constraints.

### 6.2 Current Limitations

1. ASR module currently simulated in deployed code.
2. Some model paths lack standardized benchmark reporting in-repo.
3. Additional cross-domain validation is needed for generalization claims.

### 6.3 Risk Mitigation

1. Keep deterministic fallback plugins for demo continuity.
2. Preload model checkpoints and verify local startup before jury session.
3. Freeze tested configurations for presentation day.

---

## 7. Conclusion and Future Work

SpriteStack Studio demonstrates that a local-first, AI-assisted pixel-art pipeline can be integrated into a single production-like desktop workflow. The architecture already supports modular replacement and progressive model upgrades.

Future work should prioritize:

1. Real Whisper integration with measured WER.
2. Unified benchmark suite (latency + quality metrics per module).
3. Optional fine-tuning workflows and experiment tracking for reproducible research outputs.

---

## 8. References (to format in your required citation style)

1. Sanh et al., DistilBERT.
2. Radford et al., Whisper.
3. Hu et al., LoRA.
4. RIFE / IFNet interpolation literature.
5. Stable Diffusion model references.

> Replace this section with full IEEE/APA-compliant references before final submission.

---

## Appendix A — Suggested Soutenance Evidence Checklist

1. Live demo flow (draw → AI parse → AI generation → tweening).
2. Offline proof (network disabled).
3. Endpoint health output screenshot.
4. Model loading logs.
5. Failure/fallback demonstration (`real` to `fake` behavior).

---

## Appendix B — Source Notes Used in This Draft

This draft was filled using current project artifacts, notably:

1. `api/server.py` plugin registry and endpoint contracts.
2. `api/plugins/real_parse_scene.py` model path and parsing behavior.
3. `api/plugins/real_generate_sprite.py` SD pipeline settings.
4. `api/plugins/fake_transcribe.py` current ASR status.
5. `api/plugins/real_tween_frames.py` runtime behavior.
6. `nlp_parser_model/scripts/nlp-parser-v1.ipynb` training logs and metrics.
7. `api/models/pixel_rife_rgba_integration_package/pixel-art-interpolation-report.html` tweening training description.

