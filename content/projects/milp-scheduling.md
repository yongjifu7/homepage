---
title: "GNN-Accelerated MILP Scheduling for Industrial Electroplating"
title_zh: "面向工业电镀排产的 GNN 加速 MILP 求解"
summary: "Formulated aerospace-part electroplating scheduling as a large-scale MILP and trained a GNN on historical schedules to provide warm-start solutions and variable priorities. FENNEL graph partitioning + high-confidence variable fixing reduced the effective search space by ≈ 10×; average solve time ≳ 10× faster."
summary_zh: "将航空原件电镀排产建模为大规模 MILP，使用 GNN 基于历史排产数据生成高质量初始解并排序关键变量；通过 FENNEL 流式图划分与 10% 高置信度变量固定策略，实际待优化变量减少 90%，平均求解速度提升超过 10 倍。"
date: 2025-02-15
stack: ["MILP", "GNN", "FENNEL", "Gurobi"]
order: 3
body_zh: |
  ## 问题

  航空零件的工业电镀产线排产涉及数十万个决策变量——槽位分配、工序顺序、烘干窗口、跨产线同步。
  原生 MILP 求解在生产条件变化下既慢又不稳定。

  ## 贡献

  - **精确建模。** 把整个排产问题严格建模为一个大规模混合整数线性规划。
  - **GNN 初始解引导。** 在历史排产数据上训练一个 GNN；求解时，模型给出 (i) 一个热启动的可行解
    和 (ii) 分支变量的优先级排序。平均求解时间提升**超过 10 倍**。
  - **FENNEL 流式图划分。** 把包含数十万节点的二部约束图划分成若干弱耦合的子图，将 GNN 训练/推理
    成本降低 **60%–70%**，并支持按子图并行推理。
  - **高置信度变量固定。** 把 GNN 给出的置信度最高的前 10% 决策提前固定，再进行优化，使实际待
    优化的决策变量数量减少**约 90%**，把问题复杂度压缩超过一个数量级。
---

## Problem

Industrial electroplating lines for aerospace components involve hundreds of thousands of decision variables — tank allocation, job order, drying windows, cross-line synchronisation. Vanilla MILP solves are slow and unstable under operational change.

## Contributions

- **Exact formulation** of the entire scheduling problem as a large-scale Mixed Integer Linear Program.
- **GNN initial-solution guidance.** Train a GNN on historical schedules; at solve time, the model produces (i) a warm-start feasible solution and (ii) a priority ranking over branching variables. Average solve time improves by **> 10×**.
- **FENNEL streaming partitioning.** The bipartite constraint graph (hundreds of thousands of nodes) is split into loosely-coupled subgraphs, cutting GNN train/inference cost by **60–70%** and enabling per-subgraph parallel inference.
- **High-confidence variable fixing.** The top 10% most confident decisions from the GNN are fixed before optimisation, reducing the effective number of decision variables by **≈ 90%** and compressing problem complexity by more than an order of magnitude.
