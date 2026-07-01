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
body_zh: |
  ![感知 → 编辑图像 → 再感知 → 作答的闭环，下方为训练曲线。](/images/thinking-with-image.png)

  ## 问题

  视觉语言模型经常读错图表和表格。当一张图里有几十行几十列时，无关的干扰项会渗透进答案，模型
  即使"看到"了正确的单元格，也可能报错数字。纯文字推理没法让模型真正*对*眼前的图像*采取行动*。

  这个项目希望让模型**用图像思考**：在推理过程中主动编辑自己看到的东西——遮罩掉无关的列、给
  关键的行画框、高亮一个数值——重新观察编辑后的图像，然后再作答。这种带工具的行为是端到端用
  强化学习学出来的，而不是手写脚本硬编的。

  ## 工作原理

  智能体运行一个闭环——**感知 → 编辑图像 → 再感知 → 作答**——复现并扩展了 VTool-R1 / ReFocus
  这条路线。上图展示了一个真实例子："比利时车手的总胜场是多少？"模型先推理"聚焦 Country 和
  Wins 两列"，并执行一个把其它列全部遮罩掉的动作；接着推理"聚焦 Country = Belgium 的行"，给
  这些行画上红框；读取清理过的表格后，回答 **7**。

  - **十二个视觉工具。** 动作空间是 `{列, 行, x 值, y 值} × {遮罩, 框选, 高亮}`——十二种图像
    编辑操作，模型通过写 Python 代码在图表上作画来调用它们（例如用
    `draw.rectangle(mask_bbox, fill="white")` 把无关列涂白，或者画一个描边的框来突出关键行）。
  - **工具闭环。** 一个解析器读取模型输出的工具调用动作，在沙箱里执行，把改写后的图像重新拼回
    对话上下文，触发第二轮采样——这样模型确实是根据自己刚编辑过的图作答的。从未真正调用工具的
    轨迹会被降权，促使策略把答案落在编辑后的图像上，而不是靠猜。

  ## 强化学习训练

  - **技术栈。** 在 [veRL](https://github.com/volcengine/verl) 框架上训练 `Qwen2.5-VL-3B`，用
    vLLM 异步生成（张量并行 2）、FSDP 全分片 + CPU offload——4 张 GPU 就能舒服地跑起来。
  - **优化目标。** 用 GRPO 组内标准化估计优势，并叠加 **DAPO** 增强稳定性：*clip-higher*（非
    对称的重要性采样裁剪，让低概率 token 有机会获得优势提升，同时限制其下调幅度，从而抑制熵
    塌缩）和*动态采样*（在线过滤——持续对同一个 prompt 重新采样，直到它的组内奖励既不是全对
    也不是全错，保证每个 batch 都携带有效的学习信号）。
  - **双通道奖励。** 每条轨迹同时用一个基于规则的答案相似度指标，和一个 LLM-as-judge（异步
    调用 Qwen3.5-Plus）打分，把便宜的确定性信号和对推理过程的语义判断结合起来。

  ## 结果

  在基于 `Qwen2.5-VL-3B` 的 ChartQA 类基准上：

  - 经过带视觉工具闭环的强化学习后，**答案判对率从 62% 提升到 96%**。
  - **工具调用率从 85% 提升到 95%**——策略可靠地学会了调用图像编辑工具，而不是凭空作答。
  - 消融实验中，带图像工具组的综合奖励达到约 1.1，训练全程都高于纯文本基线（约 0.8）（见上图
    `reward/overall` 与 `val/reward_score` 曲线）。
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
