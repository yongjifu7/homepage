---
title: "AURA: Autoresearch via Reflective Adaptation for Compound AI Systems"
title_zh: "AURA：面向复合 AI 系统的反射式自适应自动研究"
summary: "Inspired by Karpathy's autoresearch direction — the idea that an AI system should be able to read its own logs and rewrite itself in natural language — AURA is a sample-efficient prompt optimizer for compound AI systems built around LLM calls, retrieval, and tool use. After each rollout, AURA hands the full reasoning trace, tool outputs, and error messages back to the LLM as a diagnostic bundle and asks it to propose a single, named edit to its own system prompt. An instance-wise frontier keeps the best prompt for every training example so complementary strategies survive, and a refinement tree lets later edits inherit the diagnostic history of their ancestors. Across multi-hop QA, instruction following, privacy-conscious delegation, document retrieval, and AIME-style math, AURA matches or beats reinforcement-learning baselines (e.g. GRPO at 24k rollouts) while using up to 35× fewer rollouts, and outperforms leading prompt optimizers like MIPROv2 by ~10 points on aggregate."
summary_zh: "受卡帕西 (Andrej Karpathy) 的 *autoresearch* 思路启发——一个 AI 系统应当能读自己的日志、用自然语言重写自己——AURA 是一个面向复合 AI 系统（多次 LLM 调用 + 检索 + 工具调用）的样本高效提示优化器。每完成一次 rollout，AURA 将完整的推理轨迹、工具输出、报错信息打包成\"诊断束\"交回 LLM，并要求它提出一处具名的、对其自身 system prompt 的最小修改。一个**按实例的提示前沿**为每条训练样本保留其最优 prompt，使互补策略不被覆盖；一个**精化树**让后续编辑天然继承祖代的诊断历史。在多跳问答、指令跟随、隐私委托、文档检索、AIME 数学等任务上，AURA 在不更新一个权重的前提下与 GRPO 等强化学习基线持平甚至更好，**rollout 数最多减少 35×**，并在聚合指标上比领先提示优化器（如 MIPROv2）高约 10 个点。"
date: 2026-05-01
stack: ["LLM", "Prompt Optimization", "Compound AI", "Reflection", "Autoresearch"]
featured: true
order: 0
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

Against GRPO on Qwen3-8B, AURA matches GRPO's best aggregate score (500 train steps, 24,000
rollouts) at **≈ 1/35 of the rollout budget**, and surpasses it by several points at modest
extra budget. Against MIPROv2 on GPT-4.1-mini, AURA improves aggregate score by **+14%**
(vs. MIPROv2's +7%) under matched rollout budgets, and gains **+8%** on out-of-distribution
constraint satisfaction (IFBench) without touching a weight.

## Relation to LSL

AURA is the language-side analogue of [LSL](/publications/learning-to-search): LSL closes the
loop between a learned structural prior and search inside one solver; AURA closes the loop
between an LLM-driven program and its own diagnostic logs. Both share the same shape —
*observation → reflection → edit → re-run* — applied to different substrates (numerical
search states vs. natural-language prompts).
