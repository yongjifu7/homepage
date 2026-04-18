---
title: "Learning to Search, Searching to Learn: A Closed-Loop Framework for Large-Scale Vehicle Routing Problems"
title_zh: "Learning to Search, Searching to Learn：面向大规模车辆路径问题的闭环框架"
authors:
  - "Yongji Fu"
  - "Yong Wang"
  - "Jun Deng"
  - "et al."
venue: "NeurIPS 2026 (submission)"
venue_zh: "NeurIPS 2026（投稿中）"
year: 2025
date: 2025-09-01
pdf: "/pdfs/learning-to-search.pdf"
status: "under-review"
featured: true
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
---
