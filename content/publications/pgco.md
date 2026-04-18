---
title: "Preference-Guided Diffusion Models for Combinatorial Optimization"
title_zh: "基于偏好引导扩散模型的组合优化"
authors:
  - "Yongji Fu"
  - "Yong Wang"
  - "et al."
venue: "Under Review"
venue_zh: "审稿中"
year: 2025
status: "under-review"
featured: true
bibtex: |
  @article{fu2025preference,
    title={Preference-Guided Diffusion Models for Combinatorial Optimization},
    author={Fu, Yongji and Wang, Yong and others},
    journal={Under Review},
    year={2025}
  }
---

We propose **PGCO** (Preference-Guided Combinatorial Optimization), which combines Direct Preference Optimization (DPO) with supervised learning for non-autoregressive neural solvers. By jointly learning *decision preferences* and *solution distributions*, PGCO avoids reliance on differentiable objectives and generalises across a broad range of constrained CO problems. We also introduce an **Anisotropic GNN** (AGNN) backbone and accelerated sampling via DDIM / DPM-Solver for diffusion-based solvers.

提出 **PGCO**（偏好引导的组合优化）方法，将 DPO 与监督学习结合，通过决策偏好学习与解分布学习为非自回归神经求解器提供更精确的梯度指导；不依赖可微目标函数，可应用于更复杂的组合优化约束。配套提出各向异性图神经网络 AGNN 与两种加速采样策略（DDIM / DPM-Solver）。
