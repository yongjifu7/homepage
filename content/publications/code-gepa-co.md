---
title: "CodeGEPA: Reflective Genetic–Pareto Evolution of LLM-Generated Code Operators for Combinatorial Optimization Solvers"
title_zh: "CodeGEPA：面向组合优化求解器的 LLM 代码算子反射式遗传—帕累托进化"
authors:
  - "Yongji Fu"
  - "Yong Wang"
  - "Jun Deng"
  - "et al."
venue: "Preprint, 2026"
venue_zh: "预印本，2026"
year: 2026
date: 2026-05-01
status: "preprint"
featured: true
bibtex: |
  @article{fu2026codegepa,
    title={CodeGEPA: Reflective Genetic--Pareto Evolution of LLM-Generated Code Operators for Combinatorial Optimization Solvers},
    author={Fu, Yongji and Wang, Yong and Deng, Jun and others},
    journal={Preprint},
    year={2026}
  }
abstract_en: |
  Modern combinatorial-optimization (CO) solvers such as Hybrid Genetic Search (HGS) for the
  Capacitated Vehicle Routing Problem (CVRP) rely on a small number of expert-engineered components
  — crossover, repair, neighborhood, and subpopulation operators — that have been hand-tuned over
  decades. Recent work shows that large language models (LLMs) can synthesize these components as
  executable code, and that reinforcement-learning fine-tuning of a small LLM can occasionally
  surpass the hand-designed operator. However, RL on code-synthesis tasks is expensive: each
  trajectory requires compilation, execution against a fleet of CVRP instances, and a final
  scalar reward, and the resulting gradient signal is so sparse that thousands of rollouts are
  required even to *match* the expert baseline.

  We argue that the bottleneck is not the optimizer but the *medium of the learning signal*. A
  CO solver leaks a wealth of textual evidence at every rollout — compiler diagnostics, runtime
  exceptions, validity checks, per-instance gap traces, diversity statistics of the resulting
  population — and almost all of it is discarded by RL. We propose **CodeGEPA**, a sample-efficient
  prompt-and-code optimizer that turns this textual evidence into the primary learning medium.
  CodeGEPA (i) mutates the operator-generating prompt **reflectively** in natural language, given
  diagnostics from as few as one rollout; (ii) maintains a **Pareto frontier** of operators that
  win on at least one training instance, preventing collapse onto a single dominant strategy;
  (iii) evolves prompts in a **genetic tree** so each descendant inherits the diagnostic lessons
  of its ancestors and recombines complementary strategies. To prevent reward hacking on a fixed
  pool of instances, we add an **operator-cache penalty** that discourages re-discovery of
  previously seen operators.

  On CVRP benchmarks of up to 1,000 nodes hosted inside HGS, CodeGEPA produces crossover and
  subpopulation operators that outperform expert-designed counterparts, neuro-combinatorial
  baselines, and prompt-only LLM pipelines, while using up to **35× fewer rollouts** than an
  RL-fine-tuned 14B operator generator. The same recipe transfers without modification to TSP
  and CVRPTW under different host solvers, suggesting that reflective evolution is a generic
  way to let small LLMs author solver components that exceed human experts.
abstract_zh: |
  现代组合优化（CO）求解器——例如用于带容量限制车辆路径问题（CVRP）的 Hybrid Genetic Search (HGS)——
  依赖少量经过数十年人工调优的"专家算子"：交叉、修复、邻域、子群体等。近期工作表明大语言模型 (LLM)
  能够直接生成这些组件的可执行代码，对小型 LLM 进行强化学习微调，偶尔可以在某些算子上超过人类专家。
  但 RL 在代码生成场景上代价极高：每条轨迹都需要编译、在一批 CVRP 实例上执行、并最终只得到一个
  标量奖励；梯度信号稀疏到即便"追平"专家基线也需要数千次 rollout。

  我们认为瓶颈不在优化器本身，而在于**学习信号的载体**。一次 CO 求解中的可观察文本极为丰富——
  编译器报错、运行时异常、合法性检查、按实例的 gap 轨迹、产生种群的多样性统计——而这些信息
  几乎都被 RL 折叠成一个标量丢弃了。我们提出 **CodeGEPA**：一个面向"提示+代码"的样本高效优化器，
  把上述文本证据作为主要学习介质。CodeGEPA（i）以**自然语言反射**对算子生成提示进行变异，
  即便只来自一次 rollout 的诊断信息也能据此更新；（ii）维护一个**帕累托前沿**，
  保留所有在至少一个训练实例上获胜的算子，防止策略坍缩到单一主导解；（iii）在**遗传树**中
  组织提示的演化，使每个子代继承祖代积累的诊断教训，并能重组互补策略。为防止在固定实例池上发生
  奖励欺骗，我们引入**算子缓存惩罚**，抑制对已搜出算子的重复生成。

  在最大 1000 节点的 CVRP 基准上，将 CodeGEPA 嵌入 HGS 作为算子生成器后，所产生的交叉与子群体算子
  超过专家手工设计的算子、神经组合优化基线及仅依赖提示的 LLM 流水线；与一个 RL 微调过的 14B 算子
  生成器相比，CodeGEPA 实现同等或更好的效果，最多减少 **35× 的 rollout 数**。同一套流程不经修改
  即可迁移到 TSP 与 CVRPTW 的不同宿主求解器上，表明反射式进化是一种让小 LLM 写出"超过人类专家"
  求解器组件的通用方式。
---

## Motivation

Combinatorial-optimization (CO) solvers like HGS, OR-Tools, and LKH win because of a handful of
expert-tuned **operators** — crossover, repair, neighborhood moves, subpopulation policies — that
took the community decades to converge on. Two recent threads ask whether LLMs can author these
operators instead of humans:

1. **Prompt-only pipelines** (e.g., EoH, ReEvo) iterate on operator code with a general-purpose
   LLM and an evolutionary outer loop. They generalize broadly but plateau below the expert
   baseline on hard, large instances.
2. **RL fine-tuning of a small operator-generator LLM** (e.g., RFTHGS for CVRP) trains a 14B
   model with a tiered reward — compilable → executable → outperforms baseline — and *can* exceed
   the human-designed crossover. But thousands of rollouts are needed before the policy is
   competitive, because the only signal back from each rollout is a single scalar.

Sitting between these two threads is a simple observation: a CO rollout already produces
abundant *textual* evidence — stack traces, gap-per-instance curves, diversity statistics,
constraint-violation messages — and almost all of it is thrown away by RL. CodeGEPA is built on
the hypothesis that **operating directly on this text is a far higher-bandwidth way to learn
than condensing it into a scalar reward.**

## Framework

CodeGEPA is a prompt-and-code optimizer that sits *outside* the host solver. The host (HGS,
OR-Tools, LKH, …) is treated as a black box that accepts an LLM-generated operator and returns
a structured trace. Four mechanisms drive learning:

1. **Reflective mutation from text feedback.** After each rollout, the trace — compiler output,
   runtime errors, per-instance gaps, population statistics — is concatenated into a *diagnostic
   bundle* and handed to the LLM together with the current operator-generating prompt. The LLM
   is asked to *propose a single, named change* that should remove the most informative class of
   failures. As in GEPA, even one rollout's worth of diagnostics is usually enough to produce a
   large, directional update.

2. **Pareto illumination over instances.** Rather than keeping only the prompt with the best
   aggregate gap, CodeGEPA maintains the Pareto frontier of prompts that win on at least one
   training instance. This preserves complementary strategies (e.g., a crossover tuned for tight
   capacity vs. one tuned for long routes) and prevents the population from collapsing onto a
   single dominant operator.

3. **Genetic evolution tree.** Selected parents are mutated reflectively to produce descendants;
   periodic crossover *between* prompt candidates recombines lessons that were each discovered on
   different subsets of instances. The tree gives every descendant the diagnostic history of its
   ancestors for free.

4. **Operator-cache penalty.** Following RFTHGS, we maintain a cache of previously generated
   operators (hashed on AST plus normalized identifiers). A new operator that is near-duplicate
   to a cached one is penalized in the selection step, discouraging reward hacking on a fixed
   instance pool and explicitly pushing the search toward novel structures.

The two directions reinforce each other: **diagnostics tell the LLM where the current operator
is failing, and the Pareto frontier tells the LLM which operator families are worth keeping
around to recombine.**

## Hosts and problems

- **Host solver:** HGS for CVRP (primary); OR-Tools CP-SAT and LKH-3 (transfer).
- **Operators generated:** crossover, subpopulation policy, repair, and neighborhood acceptance.
- **Problems:** CVRP (X-set, up to 1,000 nodes), TSP, CVRPTW.
- **Generator LLM:** a small open-weight code model (≤ 14B), no RL fine-tuning required.

## Headline result

On 1,000-node CVRP instances inside HGS, CodeGEPA produces a crossover operator that beats the
expert-designed SREX baseline and the RFTHGS RL-trained operator at a fraction of the rollout
budget, while using a smaller, off-the-shelf LLM. The same procedure ports unchanged to TSP and
CVRPTW under different hosts.

## Relation to LSL

CodeGEPA is the *outer* loop to [LSL](/publications/learning-to-search): LSL closes the loop
between a learned structural prior and search inside a single solver; CodeGEPA closes the loop
between an LLM that *writes* solver components and the textual evidence those components produce.
Together they form a stack — learned operators on top, learned priors inside.
