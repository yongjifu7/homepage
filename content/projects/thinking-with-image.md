---
title: "Thinking-with-Image: RL for Tool-Augmented Visual Reasoning"
title_zh: "Thinking-with-Image：面向工具增强视觉推理的强化学习"
summary: "Reproduced and extended the VTool-R1 / ReFocus line of work so a VLM actively rewrites the chart it is reading — masking, boxing, and highlighting the relevant rows and columns mid-reasoning — turning thinking-in-text into thinking-in-image. The tool-using policy is trained end-to-end with RL (veRL + GRPO + DAPO). On ChartQA-style QA with Qwen2.5-VL-3B, answer accuracy rose from 62% to 96%."
summary_zh: "复现并扩展 VTool-R1 / ReFocus 路线，让视觉语言模型在推理过程中主动改写所读的图表——遮罩、框选、高亮相关行列——把“用文字思考”升级为“用图像思考”，并以强化学习（veRL + GRPO + DAPO）端到端训练带工具的推理策略。在 ChartQA 类问答上，Qwen2.5-VL-3B 的答案判对率从 62% 提升到 96%。"
date: 2026-03-01
stack: ["RL", "veRL", "DAPO", "GRPO", "Qwen2.5-VL", "vLLM"]
featured: true
order: 0
thumbnail: "/images/thinking-with-image.png"
---

![The perceive → edit → re-perceive → answer loop, with training curves below.](/images/thinking-with-image.png)

## Problem

Vision-language models routinely misread charts and tables. When a figure carries dozens of rows and columns, the distractor entries leak into the answer and the model reports the wrong number — even when it "sees" the right cell. Reasoning purely in text leaves the model unable to *act on* the image in front of it.

The aim of this project was to let the model **think with the image**: to actively edit what it sees mid-reasoning — mask out irrelevant columns, draw a box around the rows that matter, highlight a value — re-observe the edited image, and only then answer. That tool-using behaviour is learned end-to-end with reinforcement learning rather than hand-scripted.

## How it works

The agent runs a closed loop — **perceive → edit image → re-perceive → answer** — reproducing and extending the VTool-R1 / ReFocus line of work. The figure above walks through a real example: *"What's the total wins by Belgian riders?"* The model first reasons *"focus on columns Country and Wins"* and emits an action that masks every other column; it then reasons *"focus on rows where Country = Belgium"* and draws red boxes over those rows; reading the cleaned-up table, it answers **7**.

- **Twelve visual tools.** The action space is `{columns, rows, x-values, y-values} × {mask, box, highlight}` — twelve image-editing operations the model can call by writing Python that draws on the chart (e.g. `draw.rectangle(mask_bbox, fill="white")` to blank out irrelevant columns, or an outlined box to spotlight the relevant rows).
- **Tool loop.** A parser reads the tool-call action the model emits, executes it in a sandbox, and splices the rewritten image back into the conversation to trigger a second rollout — so the model literally answers from the picture it just edited. Trajectories that never actually use a tool are down-weighted, pushing the policy to ground its answer in the edited image instead of guessing.

## RL training

- **Stack.** `Qwen2.5-VL-3B` trained on the [veRL](https://github.com/volcengine/verl) framework, with vLLM asynchronous rollout (tensor-parallel 2), FSDP full-sharding + CPU offload — fitting comfortably on 4 GPUs.
- **Objective.** Advantages are estimated with GRPO group-wise normalisation, layered with **DAPO** for stability: *clip-higher* (asymmetric importance-sampling clipping that lets low-probability tokens gain advantage while capping downward moves, which curbs entropy collapse) and *dynamic sampling* (online filtering — keep regenerating a prompt's rollouts until its group reward is neither all-right nor all-wrong, so every batch carries usable learning signal).
- **Dual-channel reward.** Each trajectory is scored both by a rule-based answer-similarity metric and by an LLM-as-judge — an asynchronous call to Qwen3.5-Plus — combining cheap deterministic signal with semantic judgement of the reasoning.

## Results

On a ChartQA-style benchmark with `Qwen2.5-VL-3B`:

- **Answer accuracy 62% → 96%** after RL with the visual-tool loop.
- **Tool-call rate 85% → 95%** — the policy reliably learns to invoke the image-editing tools rather than answer blind.
- In ablation, the image-tool group reaches a combined reward of ≈ 1.1, staying above the text-only baseline (≈ 0.8) throughout training (see the `reward/overall` and `val/reward_score` curves above).
