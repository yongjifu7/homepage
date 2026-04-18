---
title: "GNN-Accelerated MILP Scheduling for Industrial Electroplating"
title_zh: "面向工业电镀排产的 GNN 加速 MILP 求解"
summary: "Formulated aerospace-part electroplating scheduling as a large-scale MILP and trained a GNN on historical schedules to provide warm-start solutions and variable priorities. FENNEL graph partitioning + high-confidence variable fixing reduced the effective search space by ≈ 10×; average solve time ≳ 10× faster."
summary_zh: "将航空原件电镀排产建模为大规模 MILP，使用 GNN 基于历史排产数据生成高质量初始解并排序关键变量；通过 FENNEL 流式图划分与 10% 高置信度变量固定策略，实际待优化变量减少 90%，平均求解速度提升超过 10 倍。"
date: 2025-02-15
stack: ["MILP", "GNN", "FENNEL", "Gurobi"]
order: 3
---

## Problem

Industrial electroplating lines for aerospace components involve hundreds of thousands of decision variables — tank allocation, job order, drying windows, cross-line synchronisation. Vanilla MILP solves are slow and unstable under operational change.

## Contributions

- **Exact formulation** of the entire scheduling problem as a large-scale Mixed Integer Linear Program.
- **GNN initial-solution guidance.** Train a GNN on historical schedules; at solve time, the model produces (i) a warm-start feasible solution and (ii) a priority ranking over branching variables. Average solve time improves by **> 10×**.
- **FENNEL streaming partitioning.** The bipartite constraint graph (hundreds of thousands of nodes) is split into loosely-coupled subgraphs, cutting GNN train/inference cost by **60–70%** and enabling per-subgraph parallel inference.
- **High-confidence variable fixing.** The top 10% most confident decisions from the GNN are fixed before optimisation, reducing the effective number of decision variables by **≈ 90%** and compressing problem complexity by more than an order of magnitude.
