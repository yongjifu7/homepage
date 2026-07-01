---
title: "AURA: Autoresearch via Reflective Adaptation for Compound AI Systems"
title_zh: "AURA：面向复合 AI 系统的反射式自适应自动研究"
summary: "Inspired by Karpathy's *autoresearch* direction, AURA is a sample-efficient prompt optimizer for compound AI systems: after every rollout it hands the full trace back to the LLM and asks for one named edit to its own prompt. Across multi-hop QA, instruction following, and AIME-style math, AURA matches GRPO with up to 35× fewer rollouts and beats MIPROv2 by ~10 points on aggregate."
summary_zh: "受卡帕西 (Andrej Karpathy) 的 *autoresearch* 思路启发，AURA 是一个面向复合 AI 系统的样本高效提示优化器：每次 rollout 后把完整轨迹交回 LLM，并要求它对自身 prompt 提出一处具名的修改。在多跳问答、指令跟随、AIME 数学等任务上，AURA 用最多减少 35× 的 rollout 追平 GRPO，并在聚合指标上比 MIPROv2 高约 10 个点。"
date: 2026-05-01
stack: ["LLM", "Prompt Optimization", "Compound AI", "Reflection", "Autoresearch"]
featured: true
order: 0
body_zh: |
  ## 为什么

  [卡帕西 (Andrej Karpathy) 的 *autoresearch*](https://x.com/karpathy) 思路认为，一个 AI 系统
  真正的进步单元不是一次梯度更新，而是一次用自然语言写出的"自我修改"。这个视角，恰好点出了两种
  常见的 LLM 任务适配方式之间的空白：

  1. **强化学习微调**（如 GRPO）把每次 rollout 都压缩成一个标量奖励。rollout 失败的真正原因——
     一次读错的检索结果、一个漏掉的约束、一个返回了无用报错的工具——全都被丢弃了。策略要变得有
     竞争力，往往需要成千上万次 rollout。
  2. **提示词优化器**绕开了权重更新，但通常只看得到"这个 prompt 分数变高了没有"，看不到*为什么*。
     它们在提示词空间里做组合式探索，却从不去读系统究竟做了什么。

  AURA 把 autoresearch 的想法落到实处：**rollout 本身就是我们能拿到的信息量最大的学习信号，而
  自然语言正是据此编辑系统行为的合适载体。**

  ## 框架

  AURA 是一个"系统外"的优化器，适用于任何由 LLM 调用、检索和工具使用组成的复合 AI 程序——它不
  改动任何权重。四个机制驱动学习：

  1. **基于诊断包的反思式变异。** 每次 rollout 之后，AURA 把推理轨迹、工具输入/输出、检索结果、
     标量指标以及任何领域特定的文字反馈拼接成一个"诊断包"，连同当前的系统 prompt 一起交回 LLM，
     要求它给出**一处具名的修改**，用来修复信息量最大的那一类失败。哪怕只有一次 rollout 的文字量，
     通常也足以产生一次方向明确的大幅更新——自然语言比一个标量奖励丰富得多。
  2. **按实例维护的 prompt 前沿。** AURA 不只保留聚合分数最高的那个 prompt，而是为**每一个训练
     样本**都保留在它身上表现最好的 prompt。这保留了互补的策略（一个为短查询调优的 prompt，和
     另一个为多跳推理链调优的 prompt），防止整个种群坍缩成单一的主导风格。
  3. **精化树。** 被选中的"父代" prompt 经反思式变异产生"子代"；定期在不同 prompt 之间做重组，
     把各自在不同样本子集上学到的经验合并起来。每个子代都免费继承祖先的诊断历史。
  4. **选择阶段的新颖性惩罚。** 一个记录近期生成过的 prompt 的小缓存（按结构加归一化关键词哈希）
     会在选择阶段惩罚近似重复的 prompt，防止循环反复"发现"同一处修改，推动系统探索真正新的策略。

  两个方向相互增强：**诊断包告诉 LLM 当前 prompt 在哪里失败，按实例维护的前沿则告诉它哪些 prompt
  家族值得保留下来做重组。**

  ## 任务

  - **多跳问答** —— HotpotQA 式的检索 + 推理链。
  - **指令跟随** —— IFBench 式的强约束。
  - **隐私敏感的委托** —— PUPA 式的、关于向外部工具泄露多少信息的决策。
  - **面向事实核查的文档检索** —— HoVer 式的多文档证据整合。
  - **数学推理** —— AIME-2025 风格的竞赛题。

  ## 核心结果

  在 Qwen3-8B 上与 GRPO 对比，AURA 用**约 1/35 的 rollout 预算**追平 GRPO 的最佳聚合分数（500
  训练步、10,000 次 rollout），并在略微增加预算后反超几个百分点。在 GPT-4.1-mini 上与 MIPROv2
  对比，同等 rollout 预算下 AURA 将聚合分数提升 **+9.8%**（MIPROv2 为 +4.9%），在分布外约束
  满足任务（IFBench）上提升 **+5.6%**——全程不改动一个权重。
---

## Why

[Karpathy's *autoresearch*](https://x.com/karpathy) framing — that the natural unit of progress
for an AI system is not a gradient update but a *self-edit* in natural language — points at a
gap between two common ways of adapting an LLM to a new task:

1. **Reinforcement-learning fine-tuning** (e.g. GRPO) collapses every rollout into a single
   scalar reward. The actual reason the rollout failed — a misread retrieval, a missed
   constraint, a tool that returned an unhelpful error — is discarded. Thousands of rollouts are
   needed before the policy is competitive.
2. **Prompt optimizers** sidestep weight updates but typically only see whether a prompt
   "scored higher", not *why*. They explore the prompt space combinatorially without ever
   reading what the system did.

AURA takes the autoresearch view literally: **the rollout itself is the highest-bandwidth
learning signal we will ever get, and natural language is the right substrate for editing
behavior in response to it.**

## Framework

AURA is an *outside-the-system* optimizer for any compound AI program made up of LLM calls,
retrieval, and tool use. It does not touch any weights. Four mechanisms drive learning:

1. **Reflective mutation from a diagnostic bundle.** After each rollout, AURA concatenates the
   reasoning trace, tool inputs/outputs, retrieval results, scalar metrics, and any
   domain-specific text feedback into a single bundle, hands it back to the LLM together with
   the current system prompt, and asks for *one named edit* that should fix the most
   informative class of failure. Even a single rollout's worth of text is usually enough to
   produce a large, directional update — natural language is far richer than a scalar reward.

2. **Instance-wise prompt frontier.** Rather than keeping only the prompt with the best
   aggregate score, AURA maintains, for every training instance, the prompt that solved it
   best. This preserves complementary strategies (a prompt tuned for short queries vs. one
   tuned for multi-hop chains) and prevents the population from collapsing onto a single
   dominant style.

3. **Refinement tree.** Selected parents are mutated reflectively to produce descendants;
   periodic recombination *between* prompts merges lessons that were each discovered on
   different subsets of instances. Every descendant inherits the diagnostic history of its
   ancestors for free.

4. **Selection-time novelty penalty.** A small cache of recently generated prompts (hashed on
   structure plus normalized keywords) penalizes near-duplicates at selection time, preventing
   the loop from re-discovering the same edit and pushing it toward genuinely new strategies.

The two directions reinforce each other: **the diagnostic bundle tells the LLM where its
current prompt is failing, and the instance-wise frontier tells it which prompt families are
worth keeping around to recombine.**

## Tasks

- **Multi-hop QA** — HotpotQA-style retrieval + reasoning chains.
- **Instruction following** — IFBench-style hard constraints.
- **Privacy-conscious delegation** — PUPA-style decisions about what to leak to an external
  tool.
- **Document retrieval for fact verification** — HoVer-style multi-document evidence.
- **Math reasoning** — AIME-2025 style competition problems.

## Headline result

Against GRPO on Qwen3-8B, AURA matches GRPO's best aggregate score (500 train steps, 10,000
rollouts) at **≈ 1/35 of the rollout budget**, and surpasses it by several points at modest
extra budget. Against MIPROv2 on GPT-4.1-mini, AURA improves aggregate score by **+9.8%**
(vs. MIPROv2's +4.9%) under matched rollout budgets, and gains **+5.6%** on out-of-distribution
constraint satisfaction (IFBench) without touching a weight.
