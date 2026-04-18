---
title: "Preference-Guided Combinatorial Optimization Solver"
title_zh: "基于偏好学习的组合优化求解器"
summary: "A non-autoregressive neural solver that combines DPO-style preference learning with supervised solution-distribution learning; handles non-differentiable constraints and scales via anisotropic GNN and accelerated diffusion sampling."
summary_zh: "融合 DPO 偏好学习与监督学习的非自回归神经求解器；处理不可微目标与复杂约束，通过各向异性图神经网络与扩散加速采样扩展到大规模实例。"
date: 2024-01-01
stack: ["PyTorch", "GNN", "Diffusion", "DPO"]
featured: true
order: 1
---

## Overview

Non-autoregressive neural solvers for combinatorial optimization typically face four limitations: (1) narrow generality across CO families, (2) weak handling of hard constraints, (3) heavy dependence on expensive supervised data, and (4) weak unsupervised-learning performance. **Preference-Guided Combinatorial Optimization (PGCO)** addresses all four by jointly optimising a *preference* objective and a *solution-distribution* objective.

## Contributions

- **Preference + distribution joint training.** Combine Direct Preference Optimization (DPO) with supervised distribution learning, so the solver learns both relative decision quality and global solution shape — giving sharper gradients and better generalisation.
- **Anisotropic GNN (AGNN) backbone.** Direction-aware message passing strengthens nonlinear representation on large CO graphs.
- **Accelerated sampling.** Combine DDIM with DPM-Solver for diffusion-based CO, cutting wall-clock sampling cost substantially without sacrificing solution quality.
- **Constraint-agnostic.** Because PGCO does not require a differentiable objective, it applies to problem classes where gradients through the cost function are unavailable.

## Formalisation

Given a CO instance $x$ and two candidate solutions $y^+ \succ y^-$ (preferred vs. dispreferred), the DPO loss is

$$
\mathcal{L}_{\text{DPO}}(\theta) = -\mathbb{E}_{(x, y^+, y^-)}\!\left[
\log \sigma\!\left(\beta \log \frac{\pi_\theta(y^+\mid x)}{\pi_{\text{ref}}(y^+\mid x)} - \beta \log \frac{\pi_\theta(y^-\mid x)}{\pi_{\text{ref}}(y^-\mid x)}\right)
\right].
$$

The combined PGCO objective is

$$
\mathcal{L}_{\text{PGCO}}(\theta) = \mathcal{L}_{\text{DPO}}(\theta) + \lambda \cdot \mathcal{L}_{\text{SFT}}(\theta),
$$

where $\mathcal{L}_{\text{SFT}}$ is the standard solution-distribution loss.
