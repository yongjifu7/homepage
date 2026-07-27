---
title: "Learning to Search, Searching to Learn: A Closed-Loop Framework for Large-Scale Vehicle Routing Problems"
title_zh: "Learning to Search, Searching to Learn：面向大规模车辆路径问题的闭环框架"
authors:
  - "Yongji Fu"
  - "Yi Zhou"
  - "Gaojie Jin"
  - "et al."
venue: "NeurIPS 2026"
venue_zh: "NeurIPS 2026"
year: 2025
date: 2025-09-01
pdf: "/pdfs/learning-to-search.pdf"
thumbnail: "/images/lsl-structure.png"
status: "under-review"
featured: true
draft: true
bibtex: |
  @article{fu2025learning,
    title={Learning to Search, Searching to Learn: A Closed-Loop Framework for Large-Scale Vehicle Routing Problems},
    author={Fu, Yongji and Wang, Yong and Deng, Jun and others},
    journal={Submitted to NeurIPS 2026},
    year={2025}
  }
abstract_en: |
  Large-scale Vehicle Routing Problems (VRPs) face two long-standing difficulties. On the one hand,
  many scalable methods rely on partitioning, local candidate restriction, or staged decision making
  to control computation, which weakens their modeling of global structure. On the other hand,
  although many methods introduce search at test time to improve the final solution, search is still
  typically used only as a one-shot post-processing step after model prediction. The model makes a
  prediction, search repairs it, and little sustained feedback is formed between the two. Improved
  structural states are rarely fed back to the model for subsequent inference, and high-quality search
  solutions are seldom turned into later training supervision.

  To address this issue, we propose **LSL** (**L**earning to **S**earch, **S**earching to **L**earn),
  a closed-loop learning-search framework for large-scale VRPs. LSL first predicts search-friendly
  structural priors on a sparse candidate graph, and search then iteratively refines the current
  solution under the guidance of these priors. In turn, search does not leave the system after one
  round of refinement. At inference time, the structural states returned by search are fed back to
  the model for the next round of prediction, while at training time, multiple high-quality search
  solutions are reorganized into row-wise soft targets for model update. In this way, **learning
  tells search where to explore, and search tells the model which structures are worth learning.**
  Experiments show that LSL achieves strong scalability, efficiency, and solution quality across
  multiple large-scale VRP benchmarks.
abstract_zh: |
  大规模车辆路径问题 (VRP) 面临两个长期难题。一方面，许多可扩展方法依赖于图划分、邻域候选限制或分阶段决策来控制计算量，
  这削弱了模型对全局结构的建模能力；另一方面，虽然许多方法在测试阶段引入搜索以提升解质量，但搜索通常只作为模型预测之后
  的一次性后处理——模型给出预测，搜索进行修复，两者之间缺乏持续反馈：改进后的结构状态很少被反馈回模型指导后续推理，
  而高质量的搜索解也几乎不会进入后续的训练监督。

  为解决这一问题，我们提出 **LSL**（**L**earning to **S**earch, **S**earching to **L**earn），
  一个面向大规模 VRP 的学习—搜索闭环框架。LSL 首先在稀疏候选图上预测搜索友好的结构先验，随后搜索在这些先验的引导下
  迭代精化当前解。更关键的是，搜索并不在一轮精化后就退出系统：**推理阶段**，搜索返回的结构状态被反馈给模型，用于下一轮预测；
  **训练阶段**，多条高质量搜索解被组织成行级软目标，用于模型更新。由此形成"学习告诉搜索去哪里探索，搜索告诉模型哪些
  结构值得学习"的闭环。实验表明，LSL 在多个大规模 VRP 基准上同时取得良好的可扩展性、效率和解质量。
body_zh: |
  ## 研究动机

  现有的学习式 VRP 求解器大多通过压缩决策空间来实现可扩展性——对图做划分、限制候选、或分阶段
  决策。这些手段让模型能装进有限的显存，但也丢掉了模型本该推理的全局结构。与此同时，测试阶段的
  搜索通常是接在最后的固定后处理步骤，它发现的东西从不会回流进模型。

  ## 框架

  **LSL** 把学习和搜索接成一个闭环：

  1. **稀疏结构先验。** 模型在稀疏候选图上预测一个对搜索友好的先验，为搜索提供一个"热启动"方向，
     而不是从零开始搜。
  2. **先验引导的迭代搜索。** 局部搜索在该先验的引导下精化当前解，把搜索预算集中在值得探索的地方。
  3. **推理阶段的结构反馈。** 搜索产生的结构状态被反馈给模型，用于下一轮预测——而不是被丢弃。
  4. **训练阶段的软监督。** 多条高质量搜索解被聚合成行级软目标，让模型持续从搜索已经发现的结构中
     学习。

  两个方向相互强化："**学习告诉搜索去哪里探索，搜索告诉模型哪些结构值得学习。**"

  ## 图示

  ![LSL 框架](/images/lsl-structure.png)

  ## 结果

  在 6 个规模从 10 万到 20 万节点的真实世界 Art-TSP 实例上——每一个都是把一幅名画渲染成一个巨大的
  TSP 路径——LSL 与最优解的 gap 始终保持在 **0.023%–0.039%** 之间，远优于对比的所有基线：

  | 实例 | Random Insertion | L2C-Insert | GLOP | LSL（C=1，128 trials） | LSL（C=2，256 trials） |
  |---|---|---|---|---|---|
  | mona-lisa100K | 6.706% | 3.764% | 3.224% | 0.034%（0.33h） | 0.026%（1.68h） |
  | vangogh120K | 6.812% | 4.022% | 3.156% | 0.038%（0.49h） | 0.028%（2.07h） |
  | venus140K | 6.581% | 4.102% | 3.067% | 0.027%（0.62h） | 0.023%（2.48h） |
  | pareja160K | 6.830% | 4.259% | 3.158% | 0.032%（0.87h） | 0.024%（2.71h） |
  | courbet180K | 7.145% | 4.777% | 3.294% | 0.035%（1.04h） | 0.025%（3.14h） |
  | earring200K | 7.605% | 4.514% | 3.528% | 0.039%（1.32h） | 0.029%（3.40h） |
  | **均值** | **6.947%** | **4.240%** | **3.238%** | **0.034%（0.78h）** | **0.026%（2.58h）** |

  在 **10 万节点**规模（下图 `mona-lisa100K` 实例）上，仅需 **0.33 小时**（约 20 分钟）就能把 gap
  压到 0.034%：LSL 可以在极短的时间内求解 10 万规模的实例。

  <figure>
  <img src="/images/lsl-mona-lisa-opt.png" alt="mona-lisa100K 实例的最优路径" />
  <figcaption><strong>最优路径</strong>，Art-TSP 实例 <code>mona-lisa100K</code>（N = 100,000 个城市），路径长度 5,757,191。</figcaption>
  </figure>

  <figure>
  <img src="/images/lsl-mona-lisa-lssl.png" alt="mona-lisa100K 实例上 LSL 的求解路径" />
  <figcaption><strong>LSL 求解路径</strong>，同一实例——与最优解的 gap 为 0.026%（C=2，256 trials）——与上图最优路径几乎肉眼不可分辨。</figcaption>
  </figure>
---

## Motivation

Existing learning-based VRP solvers scale by cutting the decision space — partitioning the graph,
masking candidates, or making decisions in stages. These shortcuts help the model fit in memory
but also throw away the global structure the model needs to reason over. Meanwhile, test-time
search is usually bolted on at the end as a fixed post-processor, and what it discovers never
flows back into the model.

## Framework

**LSL** closes the loop between learning and search:

1. **Sparse structural prior.** The model predicts a search-friendly prior over a sparse
   candidate graph, giving search a warm direction instead of starting cold.
2. **Guided iterative search.** Local search refines the current solution under that prior,
   keeping the exploration budget focused.
3. **Structural feedback at inference.** The structural state produced by search is fed back to
   the model for the next prediction round — not discarded.
4. **Soft supervision at training.** Multiple high-quality search solutions are aggregated into
   row-wise soft targets so the model keeps learning from what search has already found.

The two directions reinforce each other: *learning tells search where to explore, search tells
the model which structures are worth learning.*

## Figure

![LSL framework](/images/lsl-structure.png)

## Results

On six real-world Art-TSP instances ranging from 100K to 200K nodes — each a famous artwork
rendered as a giant TSP tour — LSL stays within **0.023%–0.039%** of the optimal tour length,
well inside the gap of every baseline compared:

| Instance | Random Insertion | L2C-Insert | GLOP | LSL (C=1, 128 trials) | LSL (C=2, 256 trials) |
|---|---|---|---|---|---|
| mona-lisa100K | 6.706% | 3.764% | 3.224% | 0.034% (0.33h) | 0.026% (1.68h) |
| vangogh120K | 6.812% | 4.022% | 3.156% | 0.038% (0.49h) | 0.028% (2.07h) |
| venus140K | 6.581% | 4.102% | 3.067% | 0.027% (0.62h) | 0.023% (2.48h) |
| pareja160K | 6.830% | 4.259% | 3.158% | 0.032% (0.87h) | 0.024% (2.71h) |
| courbet180K | 7.145% | 4.777% | 3.294% | 0.035% (1.04h) | 0.025% (3.14h) |
| earring200K | 7.605% | 4.514% | 3.528% | 0.039% (1.32h) | 0.029% (3.40h) |
| **Mean** | **6.947%** | **4.240%** | **3.238%** | **0.034% (0.78h)** | **0.026% (2.58h)** |

At **100K nodes** — the `mona-lisa100K` instance below — a single **0.33-hour** (≈20-minute) run
already lands within 0.034% of optimal: LSL can solve instances at this scale in a very short
amount of time.

<figure>
<img src="/images/lsl-mona-lisa-opt.png" alt="Optimal tour on the mona-lisa100K Art-TSP instance" />
<figcaption><strong>Optimal tour</strong> on the Art-TSP instance <code>mona-lisa100K</code> (N = 100,000 cities), tour length 5,757,191.</figcaption>
</figure>

<figure>
<img src="/images/lsl-mona-lisa-lssl.png" alt="LSL tour on the mona-lisa100K Art-TSP instance" />
<figcaption><strong>LSL's tour</strong> on the same instance — gap 0.026% from optimal (C=2, 256 trials) — visually indistinguishable from the optimal tour above.</figcaption>
</figure>
