---
title: "ARCO: Adaptive Reflective Code Operators for Combinatorial Optimization Solvers"
title_zh: "ARCO：面向组合优化求解器的自适应反射式代码算子"
summary: "A prompt-and-code optimizer that turns the textual evidence a CO solver produces — compiler diagnostics, runtime traces, per-instance gap curves, diversity statistics — into the primary learning signal for an LLM that writes solver components (crossover, repair, subpopulation, neighborhood acceptance). ARCO mutates the operator-generating prompt reflectively in natural language, keeps an instance-wise frontier of operators that each win on at least one training instance, evolves prompts through an adaptive refinement tree, and uses an operator-cache penalty to prevent re-discovery. Inside HGS for CVRP (up to 1,000 nodes), ARCO produces crossover and subpopulation operators that beat the expert-designed SREX baseline and an RL-trained 14B operator-generator at up to 35× fewer rollouts."
summary_zh: "一个面向\"提示 + 代码\"的样本高效优化器：把组合优化求解器在每次 rollout 中产生的文本证据——编译报错、运行时栈、按实例的 gap 曲线、种群多样性统计——作为 LLM 写算子（交叉、修复、子群体、邻域接受）的主要学习信号。ARCO 用自然语言反射变异算子生成提示，维护一个按实例的算子前沿（每个算子至少在一个训练实例上获胜），在自适应精化树中演化提示，并用算子缓存惩罚抑制重复生成。在 HGS（最大 1000 节点 CVRP）中，ARCO 生成的交叉与子群体算子超过专家手工设计的 SREX 基线及一个 RL 微调的 14B 算子生成器，rollout 数最多减少 35×。"
date: 2026-05-01
stack: ["LLM", "Combinatorial Optimization", "Code Generation", "HGS", "CVRP"]
featured: true
order: 0
---

## Why

CO solvers like HGS, OR-Tools, and LKH win because of a handful of expert-tuned **operators** —
crossover, repair, neighborhood moves, subpopulation policies — that took the community decades
to converge on. Two recent threads ask whether LLMs can author these operators instead of
humans:

1. **Prompt-only pipelines** iterate on operator code with a general-purpose LLM and an
   evolutionary outer loop. They generalize broadly but plateau below the expert baseline on
   hard, large instances.
2. **RL fine-tuning of a small operator-generator LLM** trains a 14B model with a tiered reward
   — compilable → executable → outperforms baseline — and *can* exceed the human-designed
   crossover. But thousands of rollouts are needed before the policy is competitive, because the
   only signal back from each rollout is a single scalar.

Sitting between these two threads is a simple observation: a CO rollout already produces
abundant *textual* evidence — stack traces, gap-per-instance curves, diversity statistics,
constraint-violation messages — and almost all of it is thrown away by RL. ARCO is built on the
hypothesis that **operating directly on this text is a far higher-bandwidth way to learn than
condensing it into a scalar reward.**

## Framework

ARCO is a prompt-and-code optimizer that sits *outside* the host solver. The host (HGS,
OR-Tools, LKH, …) is treated as a black box that accepts an LLM-generated operator and returns
a structured trace. Four mechanisms drive learning:

1. **Reflective mutation from text feedback.** After each rollout, the trace — compiler output,
   runtime errors, per-instance gaps, population statistics — is concatenated into a *diagnostic
   bundle* and handed to the LLM together with the current operator-generating prompt. The LLM
   is asked to *propose a single, named change* that should remove the most informative class of
   failures. Even one rollout's worth of diagnostics is usually enough to produce a large,
   directional update — diagnostic text is far richer than a scalar reward.

2. **Instance-wise operator frontier.** Rather than keeping only the prompt with the best
   aggregate gap, ARCO maintains the frontier of operators that each win on at least one
   training instance. This preserves complementary strategies (e.g., a crossover tuned for tight
   capacity vs. one tuned for long routes) and prevents the population from collapsing onto a
   single dominant operator.

3. **Adaptive refinement tree.** Selected parents are mutated reflectively to produce
   descendants; periodic recombination *between* prompt candidates merges lessons that were each
   discovered on different subsets of instances. The tree gives every descendant the diagnostic
   history of its ancestors for free.

4. **Operator-cache penalty.** We maintain a cache of previously generated operators (hashed on
   AST plus normalized identifiers). A new operator that is near-duplicate to a cached one is
   penalized in the selection step, discouraging reward hacking on a fixed instance pool and
   explicitly pushing the search toward novel structures.

The two directions reinforce each other: **diagnostics tell the LLM where the current operator
is failing, and the frontier tells the LLM which operator families are worth keeping around to
recombine.**

## Hosts and problems

- **Host solver:** HGS for CVRP (primary); OR-Tools CP-SAT and LKH-3 (transfer).
- **Operators generated:** crossover, subpopulation policy, repair, and neighborhood acceptance.
- **Problems:** CVRP (X-set, up to 1,000 nodes), TSP, CVRPTW.
- **Generator LLM:** a small open-weight code model (≤ 14B), no RL fine-tuning required.

## Headline result

On 1,000-node CVRP instances inside HGS, ARCO produces a crossover operator that beats the
expert-designed SREX baseline and an RL-trained operator-generator at a fraction of the rollout
budget, while using a smaller, off-the-shelf LLM. The same procedure ports unchanged to TSP and
CVRPTW under different hosts.

## Relation to LSL

ARCO is the *outer* loop to [LSL](/publications/learning-to-search): LSL closes the loop between
a learned structural prior and search inside a single solver; ARCO closes the loop between an
LLM that *writes* solver components and the textual evidence those components produce. Together
they form a stack — learned operators on top, learned priors inside.
