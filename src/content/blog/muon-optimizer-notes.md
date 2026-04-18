---
title: "Muon Optimizer: A Study Guide from 科学空间 (Scientific Spaces)"
title_zh: "苏剑林 Muon 优化器系列文章整理"
date: 2026-01-15
description: "A structured walk-through of the Muon optimizer — from vector vs. matrix steepest descent, to spectral-norm geometry, to Stiefel manifolds — collated from 苏剑林 (BoJone)'s posts on 科学空间."
description_zh: "按逻辑顺序整理苏剑林围绕 Muon 优化器发表的一系列文章，覆盖向量到矩阵的本质跨越、谱范数最速下降、流形上的优化、学习率与 Batch Size 的关系等。"
tags: ["optimizer", "muon", "deep learning", "study notes"]
lang: "zh"
---


> 来源：[科学空间](https://spaces.ac.cn/) (苏剑林/BoJone)
>
> 本文整理了苏剑林围绕 Muon 优化器发表的一系列文章，按逻辑顺序编排，帮助读者系统性地理解 Muon 的理论基础、实践细节和前沿扩展。

---

## 目录

**文章整理**

1. [Muon 优化器赏析：从向量到矩阵的本质跨越](#1-muon-优化器赏析从向量到矩阵的本质跨越)
2. [从谱范数梯度到新式权重衰减的思考](#2-从谱范数梯度到新式权重衰减的思考)
3. [Muon 续集：为什么我们选择尝试 Muon？](#3-muon-续集为什么我们选择尝试-muon)
4. [QK-Clip：让 Muon 在 Scaleup 之路上更进一步](#4-qk-clip让-muon-在-scaleup-之路上更进一步)
5. [流形上的最速下降系列](#5-流形上的最速下降系列)
   - 5.1 SGD + 超球面
   - 5.2 Muon + 正交
   - 5.3 Muon + Stiefel
   - 5.4 Muon + 谱球面
6. [重新思考学习率与 Batch Size（三）：Muon](#6-重新思考学习率与-batch-size三muon)
7. [Muon 优化器指南：快速上手与关键细节](#7-muon-优化器指南快速上手与关键细节)

**附录：核心概念详解**

- [Q1: 单位球约束 ‖Φ‖₂ ≤ 1 是什么意思？](#q1-单位球约束-boldsymbolphi_2-leq-1-是什么意思)
- [Q2: F 范数、谱范数、欧氏范数、向量范数](#q2-f-范数谱范数欧氏范数向量范数分别是什么)
- [Q3: 矩阵符号函数 msign](#q3-矩阵符号函数-msign-是什么)
- [Q4: SGD vs Adam vs AdamW vs Muon 公式与代码对比](#q4-sgdadamadamwmuon-完整更新公式与-pytorch-代码对比)

---

## 1. Muon 优化器赏析：从向量到矩阵的本质跨越

**原文链接**: [spaces.ac.cn/archives/10592](https://spaces.ac.cn/archives/10592)
**发表时间**: 2024年12月

### 核心问题

传统优化器（SGD、Adam 等）采用**逐元素（element-wise）**的更新规则，将所有参数展平为一个大向量来处理。但神经网络中的权重矩阵本质上是**矩阵**，逐元素处理忽略了矩阵的结构信息。Muon 的关键创新在于：**区分向量和矩阵，用更适合矩阵的方式来优化矩阵参数**。

### 向量情形：SGD 的最速下降视角

对于向量参数 $\boldsymbol{\theta}$，SGD 的更新可以理解为：

$$\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \eta \cdot \underset{\|\boldsymbol{\Phi}\|_2 \leq 1}{\arg\max} \langle \nabla L, \boldsymbol{\Phi} \rangle$$

即在单位球约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$ 下，找到使梯度内积最大的方向。答案就是梯度的归一化方向：

$$\boldsymbol{\Phi}^* = \frac{\nabla L}{\|\nabla L\|_2}$$

这就是**"梯度反方向是最速下降方向"**的精确含义——它依赖于用哪种范数来度量"方向"。

### 矩阵情形：从 F 范数到谱范数

对于矩阵参数 $\boldsymbol{W}$，常用的范数有两种：

| 范数 | 定义 | 含义 |
|------|------|------|
| **Frobenius 范数 (F 范数)** | $\|\boldsymbol{W}\|_F = \sqrt{\sum_{ij} W_{ij}^2}$ | 把矩阵展平成向量后的欧氏范数 |
| **谱范数 (2 范数)** | $\|\boldsymbol{W}\|_2 = \sigma_{\max}(\boldsymbol{W})$ | 最大奇异值，由向量范数诱导而来 |

- 如果用 **F 范数**约束，得到的最速下降结果跟向量情形一样（相当于 SGD），没有利用矩阵结构。
- 如果用**谱范数**约束，即：

$$\boldsymbol{\Phi}^* = \underset{\|\boldsymbol{\Phi}\|_2 \leq 1}{\arg\max} \langle \nabla L, \boldsymbol{\Phi} \rangle$$

此时的解是对梯度矩阵做 SVD 分解 $\nabla L = \boldsymbol{U}\boldsymbol{\Sigma}\boldsymbol{V}^{\top}$，然后取：

$$\boldsymbol{\Phi}^* = \boldsymbol{U}\boldsymbol{V}^{\top}$$

也就是说，**谱范数约束下的最速下降方向 = 梯度矩阵的 "矩阵符号函数" (msign)**，即将 SVD 中所有奇异值都替换为 1。

### Muon = 谱范数下的最速下降 + 动量

Muon 的完整算法：

1. 计算梯度 $\boldsymbol{G}_t = \nabla L(\boldsymbol{W}_t)$
2. 动量更新 $\boldsymbol{M}_t = \beta \boldsymbol{M}_{t-1} + (1-\beta)\boldsymbol{G}_t$（或 Nesterov 动量）
3. 对动量矩阵取 msign：$\boldsymbol{M}_t = \boldsymbol{U}\boldsymbol{\Sigma}\boldsymbol{V}^{\top} \Rightarrow \text{msign}(\boldsymbol{M}_t) = \boldsymbol{U}\boldsymbol{V}^{\top}$
4. 更新参数：$\boldsymbol{W}_{t+1} = \boldsymbol{W}_t - \eta \cdot \text{msign}(\boldsymbol{M}_t)$

**核心洞察**：

- 当 $\beta = 0$ 时，Muon 退化为纯粹的谱范数最速下降
- 当 $\beta > 0$ 时，动量是对梯度的更精准的估计，所以对动量取 msign
- 谱范数比 F 范数更好地度量了矩阵之间的"本质差异"，从而使每一步都走得更精准

### Newton-Schulz 迭代：高效近似 SVD

直接做 SVD 计算量大。Muon 创新性地采用 **Newton-Schulz 迭代**来近似计算 $\boldsymbol{U}\boldsymbol{V}^{\top}$：

$$\boldsymbol{X}_{t+1} = a\boldsymbol{X}_t + b\boldsymbol{X}_t(\boldsymbol{X}_t^{\top}\boldsymbol{X}_t) + c\boldsymbol{X}_t(\boldsymbol{X}_t^{\top}\boldsymbol{X}_t)^2$$

Muon 官方代码中使用的系数为 $(a, b, c) = (3.4445, -4.7750, 2.0315)$，通常迭代 5 次即可达到足够精度。

### 与 Shampoo 的关系

Muon 还有一个更久远的相关工作：2018 年的 Shampoo 优化器（《Shampoo: Preconditioned Stochastic Tensor Optimization》），两者有异曲同工之处。

### 两个关键性质

Muon 满足两个重要性质：
1. **Loss 函数的常数缩放不影响优化轨迹**（因为 msign 对缩放不变）
2. **更新量在各分量上的幅度更一致**（不同于 Adam 的逐元素归一化）

---

## 2. 从谱范数梯度到新式权重衰减的思考

**原文链接**: [spaces.ac.cn/archives/10648](https://spaces.ac.cn/archives/10648)
**发表时间**: 2024年12月

### 动机

既然 Muon 可以解读为谱范数约束下的最速下降，那么**基于谱范数的正则化**是否能产生更好的权重衰减？

### 传统权重衰减 vs 谱范数权重衰减

| 类型 | 正则项 | 梯度 | 效果 |
|------|--------|------|------|
| **传统 (L2)** | $\frac{\lambda}{2}\|\boldsymbol{W}\|_F^2$ | $\lambda \boldsymbol{W}$ | 惩罚**所有**奇异值 |
| **谱范数** | $\frac{\lambda}{2}\|\boldsymbol{W}\|_2^2$ | $\lambda \sigma_1 \boldsymbol{u}_1\boldsymbol{v}_1^{\top}$ | 只惩罚**最大**奇异值 |

### 谱范数梯度推导

谱范数在数值上等于最大奇异值 $\sigma_1$。对矩阵 $\boldsymbol{W}$ 做 SVD 分解：

$$\boldsymbol{W} = \boldsymbol{U}\boldsymbol{\Sigma}\boldsymbol{V}^{\top}$$

则 $\|\boldsymbol{W}\|_2 = \sigma_1 = \boldsymbol{u}_1^{\top}\boldsymbol{W}\boldsymbol{v}_1$

对两边取微分，可得：

$$\nabla_{\boldsymbol{W}} \|\boldsymbol{W}\|_2^2 = 2\sigma_1 \boldsymbol{u}_1 \boldsymbol{v}_1^{\top}$$

### 核心思想

- 传统 L2 权重衰减对所有参数均匀惩罚
- 谱范数权重衰减只对最大奇异值方向施加惩罚，更加"精准"
- 这与 Muon 的哲学一致：**利用矩阵的结构信息来获得更本质的优化**

---

## 3. Muon 续集：为什么我们选择尝试 Muon？

**原文链接**: [spaces.ac.cn/archives/10739](https://spaces.ac.cn/archives/10739)
**发表时间**: 2025年2月

### 背景

苏剑林所在的 Moonshot AI（月之暗面）团队在大规模 LLM 训练中实际采用了 Muon，并发布了 **Moonlight** 技术报告，记录了 Muon 优化器的首次大规模训练实践。

### 训练效率提升

核心结论：**相比 AdamW，Muon 在计算效率上实现了约 2 倍提升**。

根据 Scaling Law 结果，Muon 仅使用约 **52% 的训练计算量**就达到了与 AdamW 相当的性能。

### Match Adam Update RMS 技巧

这是从 Adam 迁移到 Muon 的关键实践技巧：

- **观察**：Adam 的 Update RMS（更新量的均方根）约等于 **0.2**，这个现象稳定可复现
- **技巧**：将 Muon 的 Update RMS 也统一调整为 0.2
- **好处**：可以直接复用 Adam 的学习率和权重衰减率，大大降低了超参数调优成本

### 权重衰减的重要性

在 Muon 的 Scaleup 过程中，发现了两个关键改进：

1. **引入权重衰减**：原始 Muon 没有权重衰减，加入后效果显著提升
2. **精确调整每个参数的更新比例**

实验表明：**Muon + 权重衰减 > 原始 Muon > AdamW**

### 从 Moonlight 到 Kimi K2

Moonlight 是第一个大规模使用 Muon 训练的模型，后续 Kimi K2（万亿参数 MoE 模型）也采用了 Muon（改进版 MuonClip）。

---

## 4. QK-Clip：让 Muon 在 Scaleup 之路上更进一步

**原文链接**: [spaces.ac.cn/archives/11126](https://spaces.ac.cn/archives/11126)
**发表时间**: 2025年7月

### 问题：MaxLogit 爆炸

当 Muon 扩展到**千亿参数以上**的模型时，出现了新的障碍：**注意力 logit 爆炸（MaxLogit Explosion）**。

具体表现：
- Attention 中的 logit 值可以超过 1000
- Softmax 输出变得极度尖锐（接近 one-hot 分布）
- 梯度变得极大或极小
- 最终导致 loss spike 或训练发散

### 发现：只有少数 head 出问题

通过逐 head 监控 MaxLogit，发现**每层只有少数几个 attention head 会出现 MaxLogit 爆炸**，大部分 head 是正常的。

### QK-Clip 方法

QK-Clip 的核心思想：

- **Per-head 缩放**：为每个 attention head 独立计算缩放因子
- 对出现爆炸的 head：乘以一个小于 1 的因子，精确抵消增长趋势
- 对正常的 head：轻微缩小（over-clipping），不会造成负面影响
- 最小化对正常训练的干扰

### 在 Kimi K2 中的应用

- Kimi K2：万亿参数 MoE 模型（总参数 1T，激活参数 320B）
- 使用 **MuonClip**（Muon + QK-Clip）训练
- 在整个 **15.5 万亿 token** 的训练过程中**没有出现任何不稳定性**
- 证明了 Muon 在超大规模上的可行性

---

## 5. 流形上的最速下降系列

这个系列从约束优化的角度系统性地推导了 Muon 及其各种约束变体。

### 5.1 SGD + 超球面

**原文链接**: [spaces.ac.cn/archives/11196](https://spaces.ac.cn/archives/11196)
**发表时间**: 2025年8月

#### 核心观点

"梯度的反方向是下降最快的方向"这句话是**有条件的**——取决于如何数学定义"方向"（用哪种范数）。当从无约束优化转到约束优化时，最速下降方向未必是梯度的反方向。

#### 超球面约束

假设参数位于单位球面上 $\|\boldsymbol{\theta}\|_2 = 1$，希望更新后参数仍在球面上。在"$\eta$ 足够小，一阶近似够用"的原则下：

- 约束条件变为：$\boldsymbol{\theta}^{\top}\boldsymbol{\Phi} = 0$（更新方向正交于当前参数）
- 加上范数约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$
- 求解带约束的最大化问题，得到球面上的最速下降方向

这为后续处理更复杂的矩阵流形打下了基础。

### 5.2 Muon + 正交

**原文链接**: [spaces.ac.cn/archives/11215](https://spaces.ac.cn/archives/11215)（注意：用户给出的链接列表中未包含此篇，但它是系列的第二篇）
**发表时间**: 2025年8月

#### 内容

- 将优化对象从向量参数扩展到**矩阵参数**
- 对更新量施加**谱范数约束** → 得到 Muon
- 进一步对参数施加**正交约束** $\boldsymbol{W}^{\top}\boldsymbol{W} = \boldsymbol{I}$ → 得到正交流形上的 Muon
- 分方阵和非方阵两种情况讨论

### 5.3 Muon + Stiefel 流形

**原文链接**: [spaces.ac.cn/archives/11221](https://spaces.ac.cn/archives/11221)
**发表时间**: 2025年8月

#### 内容

将"Muon + 正交流形"推广到更一般的 **Stiefel 流形**（列正交约束）：

- 约束条件：$\|\boldsymbol{\Phi}\|_2 = 1$，$\boldsymbol{W}^{\top}\boldsymbol{W} = \boldsymbol{I}$，$\boldsymbol{W}^{\top}\boldsymbol{\Phi} + \boldsymbol{\Phi}^{\top}\boldsymbol{W} = \boldsymbol{0}$
- 主要贡献：给出了一个**迭代算法**来求解对应的更新量
- 后续第五篇文章（对偶梯度下降）给出了另一种等价的求解方法，与 Jeremy Bernstein 在《Modular Manifolds》中的方法一致

### 5.4 Muon + 谱球面

**原文链接**: [spaces.ac.cn/archives/11241](https://spaces.ac.cn/archives/11241)
**发表时间**: 2025年8月

#### 内容

当希望参数的**谱范数始终保持恒定** $\|\boldsymbol{W}\|_2 = c$ 时的 Muon 形式：

- 这是第一篇文章（SGD + 超球面）在矩阵情形下的类比推广
- 给参数施加谱范数约束（或一般的范数约束）后，推导对应的 Muon 更新形式
- 采用"一阶近似够用"原则来简化约束，几何上对应于**切空间**

#### 系列总结

| 文章 | 参数类型 | 更新量约束 | 参数约束 |
|------|----------|------------|----------|
| 1. SGD + 超球面 | 向量 | 欧氏范数 | 单位球面 |
| 2. Muon + 正交 | 矩阵 | 谱范数 | 正交群 |
| 3. Muon + Stiefel | 矩阵 | 谱范数 | Stiefel 流形 |
| 4. Muon + 谱球面 | 矩阵 | 谱范数 | 谱范数恒定 |

---

## 6. 重新思考学习率与 Batch Size（三）：Muon

**原文链接**: [spaces.ac.cn/archives/11285](https://spaces.ac.cn/archives/11285)
**发表时间**: 2025年9月

### 背景

这是"重新思考学习率与 Batch Size"系列的第三篇。前两篇分别分析了 SGD、SignSGD、SoftSignSGD 等优化器的学习率与 Batch Size 关系。

### 分析方法：平均场近似

Muon 的关键特征是**非逐元素的更新规则**（msign 操作涉及 SVD，是全局操作），这使得之前逐元素的计算方法完全不适用。但本文引入的**平均场（Mean Field）方法**仍然可以工作，只需微调细节。

### 核心结论

**Muon 的学习率与 Batch Size 的关系与 SignSGD 一致**，没有出现新的 scaling pattern。

这个结论虽然"不意外"，但严格验证了 Muon 虽然在更新规则上比 SignSGD 复杂得多（矩阵级别的 sign 操作 vs 逐元素 sign），在学习率 scaling 行为上却保持了一致性。

---

## 7. Muon 优化器指南：快速上手与关键细节

**原文链接**: [spaces.ac.cn/archives/11416](https://spaces.ac.cn/archives/11416)
**发表时间**: 2025年11月

### 背景

截至发表时，Muon 已经：
- 经历了从数十亿到万亿参数模型的验证
- 被内置到 Torch、Keras 等训练框架中
- Megatron 等大规模框架也开始支持
- 获得了广泛的工业界认可

### 实用指南要点

这篇文章提供了从 Adam 切换到 Muon 的实用指南：

1. **Muon 仅用于 2D 权重矩阵**（线性层的权重），其余参数（bias、embedding、LayerNorm 等）仍用 Adam/AdamW
2. **Match Adam Update RMS = 0.2**：这是最重要的超参数调优技巧，使得可以复用 Adam 的学习率
3. **权重衰减**：Muon 需要加权重衰减才能发挥最佳效果
4. **Newton-Schulz 迭代**次数一般设为 5 次
5. **动量参数**：通常使用 Nesterov 动量，$\beta = 0.95$

### 关键细节

- Muon 不是完全替代 Adam，而是**混合使用**：矩阵参数用 Muon，其余用 Adam
- 这种混合策略在实践中效果最好
- Muon 的计算开销略高于 Adam（因为 Newton-Schulz 迭代），但训练效率的 2x 提升远远补偿了这一点

---

## 总结：理解 Muon 的知识地图

```
                        理论基础
                           │
              ┌────────────┼────────────┐
              │            │            │
         向量→矩阵     谱范数梯度    流形最速下降
        (10592)       (10648)      (11196系列)
              │            │            │
              └────────────┼────────────┘
                           │
                      Muon 核心算法
                    谱范数最速下降+动量
                    Newton-Schulz迭代
                           │
              ┌────────────┼────────────┐
              │            │            │
          实践应用       Scaleup      理论分析
         (10739)       (11126)      (11285)
       Moonlight      QK-Clip     LR-BS关系
     Match RMS=0.2   MaxLogit     平均场方法
       权重衰减        Kimi K2
              │            │
              └────────┬───┘
                       │
                  实用指南(11416)
                  快速上手Muon
```

### Muon 的核心要点一览

| 方面 | 要点 |
|------|------|
| **本质** | 谱范数约束下的最速下降（矩阵级别的 sign 操作） |
| **关键操作** | msign(M) = UV^T，其中 M = UΣV^T 是 SVD 分解 |
| **高效实现** | Newton-Schulz 迭代近似 SVD，系数 (3.4445, -4.7750, 2.0315) |
| **优于 Adam 之处** | 利用矩阵结构信息，训练效率约 2x |
| **使用方式** | 仅用于 2D 权重矩阵，其余参数仍用 Adam |
| **关键技巧** | Match Adam Update RMS = 0.2，加权重衰减 |
| **Scaleup 挑战** | MaxLogit 爆炸，通过 QK-Clip 解决 |
| **LR-BS 关系** | 与 SignSGD 一致 |

---

## 文章索引

| # | 标题 | 链接 | 日期 |
|---|------|------|------|
| 1 | Muon优化器赏析：从向量到矩阵的本质跨越 | [10592](https://spaces.ac.cn/archives/10592) | 2024.12 |
| 2 | 从谱范数梯度到新式权重衰减的思考 | [10648](https://spaces.ac.cn/archives/10648) | 2024.12 |
| 3 | Muon续集：为什么我们选择尝试Muon？ | [10739](https://spaces.ac.cn/archives/10739) | 2025.02 |
| 4 | QK-Clip：让Muon在Scaleup之路上更进一步 | [11126](https://spaces.ac.cn/archives/11126) | 2025.07 |
| 5 | 流形上的最速下降：1. SGD + 超球面 | [11196](https://spaces.ac.cn/archives/11196) | 2025.08 |
| 6 | 流形上的最速下降：3. Muon + Stiefel | [11221](https://spaces.ac.cn/archives/11221) | 2025.08 |
| 7 | 流形上的最速下降：4. Muon + 谱球面 | [11241](https://spaces.ac.cn/archives/11241) | 2025.08 |
| 8 | 重新思考学习率与Batch Size（三）：Muon | [11285](https://spaces.ac.cn/archives/11285) | 2025.09 |
| 9 | Muon优化器指南：快速上手与关键细节 | [11416](https://spaces.ac.cn/archives/11416) | 2025.11 |

---

## 附录：核心概念详解

### Q1: 单位球约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$ 是什么意思？

在 Muon 的推导中，"最速下降"的含义是：**在允许的更新方向中，找到使损失函数下降最快的那个方向**。但我们不能让更新量无限大（否则直接跳到最优解就行了），所以需要对更新量 $\boldsymbol{\Phi}$ 加一个大小限制。

**单位球约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$ 就是这个限制**——它要求更新方向的"长度"（由某种范数度量）不超过 1。

具体来说：

- **对于向量参数**：$\|\boldsymbol{\Phi}\|_2 \leq 1$ 表示向量的欧氏长度不超过 1，即 $\sqrt{\Phi_1^2 + \Phi_2^2 + \cdots + \Phi_n^2} \leq 1$。几何上就是一个 $n$ 维空间中的**单位球**（以原点为圆心、半径为 1 的球体）。所有满足约束的 $\boldsymbol{\Phi}$ 构成了一个球，我们在这个球里面找最优方向。

- **对于矩阵参数**：这里的 $\|\cdot\|_2$ 指的是**谱范数**（矩阵的 2-范数），即矩阵最大奇异值。$\|\boldsymbol{\Phi}\|_2 \leq 1$ 表示更新矩阵的最大奇异值不超过 1。几何上，这定义了矩阵空间中的一个"谱范数单位球"。

#### 前置知识：矩阵的奇异值到底是什么？

要理解上面提到的"最大奇异值"，需要先理解**奇异值分解（SVD）**。

**从几何直觉出发**：一个矩阵 $\boldsymbol{W} \in \mathbb{R}^{m \times n}$ 本质上代表一个**线性变换**——它把一个 $n$ 维向量映射到一个 $m$ 维向量。那么这个变换对空间做了什么？

想象 $n$ 维空间中的一个**单位球**（所有长度为 1 的向量的集合）。经过矩阵 $\boldsymbol{W}$ 的变换后，这个球会变成一个**椭球**。SVD 就是精确描述这个椭球的工具：

$$\boldsymbol{W} = \boldsymbol{U} \boldsymbol{\Sigma} \boldsymbol{V}^\top$$

其中：
- $\boldsymbol{V}$ 的列向量 $\boldsymbol{v}_1, \boldsymbol{v}_2, \ldots$：椭球各轴在**输入空间**中的方向（旋转输入）
- $\boldsymbol{U}$ 的列向量 $\boldsymbol{u}_1, \boldsymbol{u}_2, \ldots$：椭球各轴在**输出空间**中的方向（旋转输出）
- $\boldsymbol{\Sigma}$ 对角线上的值 $\sigma_1 \geq \sigma_2 \geq \cdots \geq \sigma_r \geq 0$：椭球各轴的**半径**，即每个方向上的**拉伸倍数**

这些 $\sigma_i$ 就是**奇异值**。

```
输入空间（单位球）          矩阵 W 的作用          输出空间（椭球）

      v₂                                              u₂
      │                                               │
      │    ·····                                      │   · · ·
      │ ·       ·          W                        │·           ·
      ·           ·   ──────────→              ·    │              ·
 ─────●───────────·── v₁              ─────── ·────●──────────────·── u₁
      ·           ·                            ·   │              ·
      │ ·       ·                                │·           ·
      │    ·····                                  │   · · ·
      │                                           │
   半径=1, 半径=1                           半径=σ₁(大), 半径=σ₂(小)
```

**具体例子**：假设 $\boldsymbol{W}$ 的奇异值是 $\sigma_1 = 10, \sigma_2 = 3, \sigma_3 = 1$：
- 沿 $\boldsymbol{v}_1$ 方向的输入，被拉伸 **10 倍**后输出到 $\boldsymbol{u}_1$ 方向
- 沿 $\boldsymbol{v}_2$ 方向的输入，被拉伸 **3 倍**后输出到 $\boldsymbol{u}_2$ 方向
- 沿 $\boldsymbol{v}_3$ 方向的输入，被拉伸 **1 倍**（不变）后输出到 $\boldsymbol{u}_3$ 方向

#### 为什么有"最大"奇异值？

一个 $m \times n$ 矩阵有 $r = \min(m, n)$ 个奇异值（按惯例从大到小排列）。**最大奇异值 $\sigma_1$** 有明确的物理/数学含义：

$$\sigma_1 = \sigma_{\max}(\boldsymbol{W}) = \max_{\|\boldsymbol{x}\|_2 = 1} \|\boldsymbol{W}\boldsymbol{x}\|_2$$

即：**矩阵能把单位向量最多拉伸多少倍**。这就是矩阵的谱范数。

类比理解：

| 概念 | 类比 |
|------|------|
| 所有奇异值 $(\sigma_1, \sigma_2, \ldots)$ | 一根弹簧在各个方向上的弹力系数 |
| 最大奇异值 $\sigma_1$ | 弹簧最硬的那个方向的弹力 |
| 最小奇异值 $\sigma_r$ | 弹簧最软的那个方向的弹力 |
| $\sigma_1 / \sigma_r$（条件数） | 弹簧"各向异性"的程度，越大越不均匀 |

#### 奇异值在优化中的数学含义

在神经网络优化中，奇异值的角色至关重要：

**1. 衡量权重矩阵的"力量分布"**

一个权重矩阵的奇异值反映了它在不同方向上的**信号放大能力**：
- $\sigma_1$ 很大 → 某个方向的信号被极度放大 → 可能导致梯度爆炸
- $\sigma_r$ 很小 → 某个方向的信号被极度压缩 → 可能导致梯度消失
- 所有 $\sigma_i$ 接近 → 各方向均匀处理信号 → 训练最稳定

**2. 决定梯度的传播质量**

在反向传播中，梯度经过权重矩阵 $\boldsymbol{W}^\top$ 的变换。如果 $\boldsymbol{W}$ 的奇异值差异很大（条件数 $\sigma_1/\sigma_r \gg 1$），梯度在强方向上会被放大，在弱方向上会被压缩，导致**优化景观扭曲**（一些方向很陡峭，一些方向很平坦）。

**3. 在 Muon 中的核心角色**

Muon 通过 msign 操作**将所有奇异值统一设为 1**，这意味着：
- 更新方向在所有奇异值方向上**均匀用力**
- 梯度信号弱的方向（小奇异值）不会被忽略
- 梯度信号强的方向（大奇异值）不会主导更新
- 相当于在一个"条件数 = 1 的完美空间"中做优化

```
梯度矩阵的奇异值: σ₁=100, σ₂=10, σ₃=1

SGD 的处理（F范数归一化）:
  → 更新 ∝ (100, 10, 1) / √(100²+10²+1²)
  → σ₁方向主导，σ₃方向几乎被忽略

Muon 的处理（msign）:
  → 更新 ∝ (1, 1, 1)
  → 所有方向均匀更新，弱信号被放大100倍
```

**4. 约束中的含义**

回到单位球约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$：

- $\|\boldsymbol{\Phi}\|_2 = \sigma_{\max}(\boldsymbol{\Phi})$，即更新矩阵的**最大拉伸倍数不超过 1**
- 这个约束下，更新矩阵不会在任何方向上"过度拉伸"输入信号
- 但它**允许在多个方向上同时达到最大拉伸**（所有奇异值都可以等于 1）
- 最优解 $\boldsymbol{\Phi}^* = \boldsymbol{U}\boldsymbol{V}^\top$ 恰好就是所有奇异值都等于 1 的矩阵——在"预算"内塞进了最多的"信息"

对比：如果用 F 范数约束 $\|\boldsymbol{\Phi}\|_F \leq 1$（即 $\sqrt{\sigma_1^2 + \sigma_2^2 + \cdots} \leq 1$），总预算是固定的，多个方向要分摊预算。这就好比：
- **谱范数约束**：每个方向独立限制"最多拉伸 1 倍"，各方向互不影响 → 可以所有方向都拉满
- **F 范数约束**：所有方向共享总预算，分给一个方向多了，其他方向就少了 → 被迫集中在最重要的方向

这就是为什么谱范数约束下的最优解（Muon）比 F 范数约束下的最优解（SGD）更"均匀"、更能利用矩阵结构。

**为什么约束的选择很重要？**

不同的范数定义了不同形状的"单位球"，从而导致不同的最优方向：

| 约束 | 单位球形状 | 最优方向 | 对应优化器 |
|------|-----------|---------|-----------|
| $\|\boldsymbol{\Phi}\|_F \leq 1$（F 范数） | 高维超球面 | $\frac{\nabla L}{\|\nabla L\|_F}$（归一化梯度） | SGD |
| $\|\boldsymbol{\Phi}\|_2 \leq 1$（谱范数） | "扁平"的矩阵球 | $\text{msign}(\nabla L) = \boldsymbol{U}\boldsymbol{V}^\top$ | Muon |
| $\|\boldsymbol{\Phi}\|_\infty \leq 1$（无穷范数） | 超立方体 | $\text{sign}(\nabla L)$（逐元素取符号） | SignSGD |

直觉理解：约束 $\|\boldsymbol{\Phi}\|_2 \leq 1$ 就像给优化器一个"预算"——你每一步最多只能走这么远（按照谱范数度量），在这个预算内，选一个让损失下降最多的方向。Muon 的核心洞察是：**用谱范数做预算（而不是 F 范数），能更好地利用矩阵结构信息，从而走出更高效的一步**。

---

### Q2: F 范数、谱范数、欧氏范数、向量范数分别是什么？

#### 向量范数（Vector Norm）

向量范数是用来衡量向量"大小"的函数。常见的向量范数属于 **$p$-范数族**：

$$\|\boldsymbol{x}\|_p = \left(\sum_{i=1}^{n} |x_i|^p \right)^{1/p}$$

几个重要的特例：

| 名称 | 记号 | 公式 | 直觉 | 例子：$\boldsymbol{x} = (3, -4)$ |
|------|------|------|------|------|
| **1-范数**（曼哈顿范数） | $\|\boldsymbol{x}\|_1$ | $\sum_i \|x_i\|$ | 各分量绝对值之和 | $\|3\| + \|-4\| = 7$ |
| **2-范数**（欧氏范数） | $\|\boldsymbol{x}\|_2$ | $\sqrt{\sum_i x_i^2}$ | 向量的几何长度 | $\sqrt{9 + 16} = 5$ |
| **$\infty$-范数** | $\|\boldsymbol{x}\|_\infty$ | $\max_i \|x_i\|$ | 最大分量的绝对值 | $\max(3, 4) = 4$ |

**欧氏范数**就是 2-范数，也就是我们日常理解的向量长度（勾股定理的推广）。

#### 矩阵范数（Matrix Norm）

矩阵范数有两大类来源：

**（1）直接推广类：Frobenius 范数（F 范数）**

$$\|\boldsymbol{W}\|_F = \sqrt{\sum_{i,j} W_{ij}^2} = \sqrt{\text{tr}(\boldsymbol{W}^\top \boldsymbol{W})} = \sqrt{\sum_i \sigma_i^2}$$

- **本质**：把矩阵的所有元素排成一个大向量，然后算这个向量的欧氏范数
- **和奇异值的关系**：等于所有奇异值的平方和的平方根
- **特点**：计算简单，但**完全忽略了矩阵的结构**——把 $m \times n$ 矩阵当成 $mn$ 维向量处理

**（2）算子范数类：谱范数（Spectral Norm）**

$$\|\boldsymbol{W}\|_2 = \max_{\|\boldsymbol{x}\|_2 = 1} \|\boldsymbol{W}\boldsymbol{x}\|_2 = \sigma_{\max}(\boldsymbol{W})$$

- **本质**：矩阵作为线性变换，能把单位向量最多拉伸多少倍
- **数值上**：等于矩阵的最大奇异值 $\sigma_1$
- **名称来源**：奇异值也叫"谱"（spectrum），所以叫谱范数
- **特点**：**真正反映了矩阵作为变换的"力量"**，充分利用了矩阵结构

> **注意符号重载**：$\|\cdot\|_2$ 作用在向量上是欧氏范数，作用在矩阵上是谱范数（算子 2-范数）。它们通过"诱导"关系联系：矩阵的 2-范数是由向量的 2-范数诱导（induced）出来的。

#### 核心对比

| | F 范数 | 谱范数 |
|---|---|---|
| **视角** | 矩阵 = 大向量 | 矩阵 = 线性变换 |
| **公式** | $\sqrt{\sigma_1^2 + \sigma_2^2 + \cdots + \sigma_r^2}$ | $\sigma_1$（仅最大奇异值） |
| **计算成本** | 低（元素平方和） | 高（需要 SVD 或迭代） |
| **是否利用矩阵结构** | 否 | 是 |
| **约束下的最速下降** | 得到 SGD（归一化梯度） | 得到 Muon（msign） |

**举例说明**：假设一个矩阵的奇异值为 $(10, 1, 1, 1)$：
- F 范数 = $\sqrt{100 + 1 + 1 + 1} = \sqrt{103} \approx 10.15$
- 谱范数 = $10$

F 范数告诉你"元素总量有多大"，谱范数告诉你"这个变换最猛的方向有多猛"。对于优化来说，**谱范数提供了更本质的矩阵度量**，这正是 Muon 选择它的原因。

---

### Q3: 矩阵符号函数 msign 是什么？

#### 标量 sign → 向量 sign → 矩阵 msign

**msign** 是 **matrix sign** 的缩写，是标量符号函数 $\text{sign}(x)$ 到矩阵的自然推广。理解它的关键是从标量一步步推广：

**标量 sign**：

$$\text{sign}(x) = \begin{cases} +1 & x > 0 \\ 0 & x = 0 \\ -1 & x < 0 \end{cases}$$

作用：**保留方向（正/负），丢弃大小**。把任何非零数映射到 $\pm 1$。

**向量 sign**（逐元素）：

$$\text{sign}(\boldsymbol{x}) = \left(\text{sign}(x_1), \text{sign}(x_2), \ldots, \text{sign}(x_n)\right)$$

作用：对每个分量独立取符号。这是 SignSGD 的核心操作。

**矩阵 msign**：

对矩阵 $\boldsymbol{M}$ 做奇异值分解（SVD）：

$$\boldsymbol{M} = \boldsymbol{U} \boldsymbol{\Sigma} \boldsymbol{V}^\top = \sum_{i=1}^{r} \sigma_i \boldsymbol{u}_i \boldsymbol{v}_i^\top$$

其中 $\sigma_1 \geq \sigma_2 \geq \cdots \geq \sigma_r > 0$ 是奇异值。

矩阵符号函数定义为：**将所有奇异值替换为 1**：

$$\text{msign}(\boldsymbol{M}) = \boldsymbol{U} \boldsymbol{V}^\top = \sum_{i=1}^{r} 1 \cdot \boldsymbol{u}_i \boldsymbol{v}_i^\top$$

#### 直觉理解

SVD 分解把一个矩阵拆成若干"方向对"$(\boldsymbol{u}_i, \boldsymbol{v}_i)$ 和对应的"强度"$\sigma_i$：

$$\boldsymbol{M} = \underbrace{\sigma_1}_{\text{强度}} \underbrace{\boldsymbol{u}_1 \boldsymbol{v}_1^\top}_{\text{方向}} + \sigma_2 \boldsymbol{u}_2 \boldsymbol{v}_2^\top + \cdots$$

msign 做的事情是：**保留所有方向，但把每个方向的强度统一设为 1**：

$$\text{msign}(\boldsymbol{M}) = \underbrace{1}_{\text{统一强度}} \cdot \boldsymbol{u}_1 \boldsymbol{v}_1^\top + 1 \cdot \boldsymbol{u}_2 \boldsymbol{v}_2^\top + \cdots$$

这意味着：
- **弱方向被增强**：原来强度很小的方向被提升到 1
- **强方向被压缩**：原来强度很大的方向被降低到 1
- **方向信息完整保留**：哪些 $(\boldsymbol{u}_i, \boldsymbol{v}_i)$ 对存在完全不变

#### 为什么 msign 是 sign 的矩阵推广？

| 操作 | 输入 | 分解 | 操作 | 输出 |
|------|------|------|------|------|
| sign(x) | 标量 $x$ | $x = \|x\| \cdot \text{sign}(x)$ | 大小→1，保留符号 | $\pm 1$ |
| sign($\boldsymbol{x}$) | 向量 | 每个分量 $x_i = \|x_i\| \cdot \text{sign}(x_i)$ | 每个分量大小→1 | $(\pm 1, \ldots, \pm 1)$ |
| msign($\boldsymbol{M}$) | 矩阵 | $\boldsymbol{M} = \sum_i \sigma_i \boldsymbol{u}_i\boldsymbol{v}_i^\top$ | 每个奇异值→1 | $\boldsymbol{U}\boldsymbol{V}^\top$ |

三者的共同本质：**去掉"大小"信息，只保留"方向"信息**。只是"方向"的含义随着数学对象的复杂度提升而变得更丰富：
- 标量的"方向"= 正/负号
- 向量的"方向"= 各分量的正/负号
- 矩阵的"方向"= SVD 中的左右奇异向量对

#### msign 的几何性质

$\text{msign}(\boldsymbol{M}) = \boldsymbol{U}\boldsymbol{V}^\top$ 是一个**正交矩阵**（当 $\boldsymbol{M}$ 是方阵时）或**半正交矩阵**（当 $\boldsymbol{M}$ 是长方阵时），满足：

$$(\boldsymbol{U}\boldsymbol{V}^\top)^\top (\boldsymbol{U}\boldsymbol{V}^\top) = \boldsymbol{V}\boldsymbol{U}^\top\boldsymbol{U}\boldsymbol{V}^\top = \boldsymbol{I}$$

这意味着 msign 的输出是一个**等距变换**（保持长度不变的线性变换），这正是"纯方向、无缩放"的数学体现。

#### 实际计算：Newton-Schulz 迭代

直接计算 SVD 再组合 $\boldsymbol{U}\boldsymbol{V}^\top$ 代价高昂（$O(mn^2)$）。Muon 使用 **Newton-Schulz 迭代**来高效近似：

1. 初始化：$\boldsymbol{X}_0 = \boldsymbol{M} / \|\boldsymbol{M}\|_F$（归一化，使奇异值落在 $(0, 1]$）
2. 迭代：$\boldsymbol{X}_{k+1} = a\boldsymbol{X}_k + b\boldsymbol{X}_k(\boldsymbol{X}_k^\top\boldsymbol{X}_k) + c\boldsymbol{X}_k(\boldsymbol{X}_k^\top\boldsymbol{X}_k)^2$
3. 系数：$(a, b, c) = (3.4445, -4.7750, 2.0315)$
4. 迭代 5 次后 $\boldsymbol{X}_5 \approx \boldsymbol{U}\boldsymbol{V}^\top$

**原理**：这个迭代本质上是在对每个奇异值 $\sigma$ 反复施加函数 $f(\sigma) = a\sigma + b\sigma^3 + c\sigma^5$，该函数被精心设计为在 $[0, 1]$ 区间上快速收敛到 1。经过几轮迭代，所有奇异值都趋近于 1，从而 $\boldsymbol{X}_k \to \boldsymbol{U}\boldsymbol{V}^\top$。

---

### Q4: SGD、Adam、AdamW、Muon 完整更新公式与 PyTorch 代码对比

#### 一、数学公式对比

##### SGD（含动量）

最经典的优化器。给定参数 $\boldsymbol{\theta}$，学习率 $\eta$，动量系数 $\mu$，权重衰减 $\lambda$：

$$
\begin{aligned}
& \boldsymbol{g}_t = \nabla L(\boldsymbol{\theta}_t) + \lambda \boldsymbol{\theta}_t & \text{（梯度 + L2 正则）} \\
& \boldsymbol{b}_t = \mu \boldsymbol{b}_{t-1} + \boldsymbol{g}_t & \text{（动量累积）} \\
& \boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \eta \cdot \boldsymbol{b}_t & \text{（参数更新）}
\end{aligned}
$$

若使用 **Nesterov 动量**，则更新变为：

$$
\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \eta \cdot (\boldsymbol{g}_t + \mu \boldsymbol{b}_t)
$$

**关键特征**：
- **无自适应**：所有参数共享同一个学习率 $\eta$，不根据历史梯度调整
- 更新方向就是（累积动量后的）梯度方向本身
- 对应 F 范数约束下的最速下降：$\boldsymbol{\Phi}^* = \nabla L / \|\nabla L\|_F$
- 权重衰减与 L2 正则等价（因为没有自适应缩放）
- 简单高效，但对不同尺度的参数一视同仁，可能需要精心调节学习率

##### Adam

给定参数 $\boldsymbol{\theta}$，学习率 $\eta$，衰减率 $\beta_1, \beta_2$，小常数 $\epsilon$：

$$
\begin{aligned}
& \boldsymbol{g}_t = \nabla L(\boldsymbol{\theta}_t) \\
& \boldsymbol{m}_t = \beta_1 \boldsymbol{m}_{t-1} + (1 - \beta_1) \boldsymbol{g}_t & \text{（一阶动量）} \\
& \boldsymbol{v}_t = \beta_2 \boldsymbol{v}_{t-1} + (1 - \beta_2) \boldsymbol{g}_t^2 & \text{（二阶动量，逐元素平方）} \\
& \hat{\boldsymbol{m}}_t = \frac{\boldsymbol{m}_t}{1 - \beta_1^t} & \text{（偏差修正）} \\
& \hat{\boldsymbol{v}}_t = \frac{\boldsymbol{v}_t}{1 - \beta_2^t} & \text{（偏差修正）} \\
& \boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \eta \cdot \frac{\hat{\boldsymbol{m}}_t}{\sqrt{\hat{\boldsymbol{v}}_t} + \epsilon}
\end{aligned}
$$

**关键特征**：
- 逐元素（element-wise）操作，$\boldsymbol{g}_t^2$ 和除法都是逐元素的
- 自适应学习率：每个参数有自己的有效学习率 $\eta / (\sqrt{\hat{v}_{t,i}} + \epsilon)$
- L2 正则化通过修改损失函数实现：$L' = L + \frac{\lambda}{2}\|\boldsymbol{\theta}\|^2$，此时梯度变为 $\boldsymbol{g}_t + \lambda\boldsymbol{\theta}_t$，但 L2 项也会被自适应缩放，导致正则化效果被削弱

##### AdamW

AdamW 的前几步与 Adam 相同，唯一区别在最后一步——**权重衰减解耦**：

$$
\begin{aligned}
& \boldsymbol{g}_t = \nabla L(\boldsymbol{\theta}_t) & \text{（纯损失梯度，不含正则项）} \\
& \boldsymbol{m}_t = \beta_1 \boldsymbol{m}_{t-1} + (1 - \beta_1) \boldsymbol{g}_t \\
& \boldsymbol{v}_t = \beta_2 \boldsymbol{v}_{t-1} + (1 - \beta_2) \boldsymbol{g}_t^2 \\
& \hat{\boldsymbol{m}}_t = \frac{\boldsymbol{m}_t}{1 - \beta_1^t}, \quad \hat{\boldsymbol{v}}_t = \frac{\boldsymbol{v}_t}{1 - \beta_2^t} \\
& \boldsymbol{\theta}_{t+1} = (1 - \eta\lambda) \boldsymbol{\theta}_t - \eta \cdot \frac{\hat{\boldsymbol{m}}_t}{\sqrt{\hat{\boldsymbol{v}}_t} + \epsilon}
\end{aligned}
$$

**关键区别**：
- 权重衰减项 $(1 - \eta\lambda)\boldsymbol{\theta}_t$ 直接作用在参数上，**不经过** $\boldsymbol{m}_t / \boldsymbol{v}_t$ 的自适应缩放
- 这意味着每个参数受到的正则化强度是均匀的，不会因为梯度大而被稀释
- 实践中 AdamW 的正则化效果显著优于 Adam + L2

##### Muon

Muon **只用于 2D 权重矩阵** $\boldsymbol{W} \in \mathbb{R}^{m \times n}$（Embedding、LayerNorm 等非矩阵参数仍用 AdamW）：

$$
\begin{aligned}
& \boldsymbol{G}_t = \nabla L(\boldsymbol{W}_t) \\
& \boldsymbol{M}_t = \beta \boldsymbol{M}_{t-1} + (1 - \beta) \boldsymbol{G}_t & \text{（Nesterov 动量）} \\
& \boldsymbol{W}_{t+1} = (1 - \eta\lambda) \boldsymbol{W}_t - \eta \cdot \mu \cdot \text{msign}(\boldsymbol{M}_t)
\end{aligned}
$$

其中 $\text{msign}(\boldsymbol{M}_t) = \boldsymbol{U}\boldsymbol{V}^\top$（$\boldsymbol{M}_t = \boldsymbol{U}\boldsymbol{\Sigma}\boldsymbol{V}^\top$ 的 SVD）。

$\mu$ 是一个缩放因子，用于 **Match Adam Update RMS**，典型值使得更新量的 RMS $\approx 0.02$。

**关键特征**：
- 不是逐元素操作，而是对**整个矩阵**做 msign
- 没有二阶动量（没有 $\boldsymbol{v}_t$），因此内存更省
- 更新方向由矩阵的 SVD 结构决定，利用了矩阵的全局信息
- 更新量 $\text{msign}(\boldsymbol{M}_t)$ 是（半）正交矩阵，所有奇异值均为 1

#### 二、四者核心差异对比

| | **SGD** | **Adam** | **AdamW** | **Muon** |
|---|---|---|---|---|
| **操作粒度** | 逐元素 | 逐元素 | 逐元素 | 整个矩阵 |
| **更新方向** | $\boldsymbol{b}_t$（动量梯度） | $\hat{m}_t / (\sqrt{\hat{v}_t} + \epsilon)$ | 同 Adam | $\text{msign}(\boldsymbol{M}_t) = \boldsymbol{U}\boldsymbol{V}^\top$ |
| **自适应机制** | 无 | 二阶动量 $v_t$（逐元素） | 同 Adam | 谱范数归一化（矩阵级别） |
| **权重衰减** | 等价于 L2 正则 | 耦合在梯度中（被自适应缩放） | 解耦（直接衰减参数） | 解耦（直接衰减参数） |
| **适用参数** | 所有参数 | 所有参数 | 所有参数 | 仅 2D 权重矩阵 |
| **状态内存** | $b_t$（1× 参数量） | $m_t + v_t$（2× 参数量） | $m_t + v_t$（2× 参数量） | 仅 $M_t$（1× 参数量） |
| **核心范数** | F 范数（欧氏） | 无（逐元素缩放） | 无（逐元素缩放） | 谱范数 |
| **对梯度缩放的不变性** | 否（更新正比于梯度） | 否（$v_t$ 会变） | 否 | 是（msign 对缩放不变） |
| **典型学习率** | $10^{-2} \sim 10^{-1}$ | $10^{-4} \sim 10^{-3}$ | $10^{-4} \sim 10^{-3}$ | $0.02$（Match RMS） |

#### 三、PyTorch 代码对比

##### SGD（简化实现，含动量 + Nesterov）

```python
class SimpleSGD(torch.optim.Optimizer):
    def __init__(self, params, lr=0.01, momentum=0.9, weight_decay=0, nesterov=False):
        defaults = dict(lr=lr, momentum=momentum, weight_decay=weight_decay, nesterov=nesterov)
        super().__init__(params, defaults)

    @torch.no_grad()
    def step(self):
        for group in self.param_groups:
            lr = group['lr']
            mu = group['momentum']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad

                # L2 正则（对 SGD 来说等价于权重衰减）
                if wd != 0:
                    grad = grad.add(p, alpha=wd)         # g = g + λθ

                state = self.state[p]
                if len(state) == 0:
                    state['buf'] = torch.zeros_like(p)   # 动量缓冲（1 份状态）

                buf = state['buf']
                buf.mul_(mu).add_(grad)                  # b = μ*b + g

                if group['nesterov']:
                    update = grad.add(buf, alpha=mu)      # g + μ*b
                else:
                    update = buf

                # 参数更新：θ = θ - lr * update
                p.add_(update, alpha=-lr)
```

##### Adam（简化实现）

```python
class SimpleAdam(torch.optim.Optimizer):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0):
        defaults = dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay)
        super().__init__(params, defaults)

    @torch.no_grad()
    def step(self):
        for group in self.param_groups:
            lr = group['lr']
            beta1, beta2 = group['betas']
            eps = group['eps']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad

                # Adam 的 L2 正则：把权重衰减加到梯度里
                if wd != 0:
                    grad = grad.add(p, alpha=wd)

                state = self.state[p]
                if len(state) == 0:
                    state['step'] = 0
                    state['m'] = torch.zeros_like(p)  # 一阶动量
                    state['v'] = torch.zeros_like(p)  # 二阶动量

                state['step'] += 1
                m, v = state['m'], state['v']

                # 更新动量
                m.mul_(beta1).add_(grad, alpha=1 - beta1)       # m = β1*m + (1-β1)*g
                v.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)  # v = β2*v + (1-β2)*g²

                # 偏差修正
                m_hat = m / (1 - beta1 ** state['step'])
                v_hat = v / (1 - beta2 ** state['step'])

                # 参数更新：θ = θ - lr * m_hat / (√v_hat + ε)
                p.addcdiv_(m_hat, v_hat.sqrt().add_(eps), value=-lr)
```

##### AdamW（简化实现）

```python
class SimpleAdamW(torch.optim.Optimizer):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01):
        defaults = dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay)
        super().__init__(params, defaults)

    @torch.no_grad()
    def step(self):
        for group in self.param_groups:
            lr = group['lr']
            beta1, beta2 = group['betas']
            eps = group['eps']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad  # 纯梯度，不含正则项

                state = self.state[p]
                if len(state) == 0:
                    state['step'] = 0
                    state['m'] = torch.zeros_like(p)
                    state['v'] = torch.zeros_like(p)

                state['step'] += 1
                m, v = state['m'], state['v']

                m.mul_(beta1).add_(grad, alpha=1 - beta1)
                v.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)

                m_hat = m / (1 - beta1 ** state['step'])
                v_hat = v / (1 - beta2 ** state['step'])

                # 关键区别：权重衰减直接作用在参数上，与自适应缩放无关
                p.mul_(1 - lr * wd)                                    # 解耦权重衰减
                p.addcdiv_(m_hat, v_hat.sqrt().add_(eps), value=-lr)   # Adam 更新
```

##### Muon（简化实现）

```python
class SimpleMuon(torch.optim.Optimizer):
    """Muon: 仅用于 2D 权重矩阵的优化器"""
    def __init__(self, params, lr=0.02, momentum=0.95, nesterov=True,
                 weight_decay=0, ns_steps=5):
        defaults = dict(lr=lr, momentum=momentum, nesterov=nesterov,
                        weight_decay=weight_decay, ns_steps=ns_steps)
        super().__init__(params, defaults)

    @torch.no_grad()
    def _newton_schulz(self, M, steps=5):
        """Newton-Schulz 迭代近似 msign(M) = U @ V.T"""
        a, b, c = 3.4445, -4.7750, 2.0315
        X = M / (M.norm() + 1e-7)  # 归一化使奇异值落在 (0, 1]
        for _ in range(steps):
            A = X @ X.T                     # A = X X^T
            X = a * X + b * (A @ X) + c * (A @ (A @ X))  # 多项式迭代
        return X

    @torch.no_grad()
    def step(self):
        for group in self.param_groups:
            lr = group['lr']
            mu = group['momentum']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                assert p.ndim == 2, "Muon 仅用于 2D 权重矩阵"
                grad = p.grad

                state = self.state[p]
                if len(state) == 0:
                    state['buf'] = torch.zeros_like(grad)  # 动量缓冲（仅 1 份状态）

                buf = state['buf']

                # Nesterov 动量
                buf.mul_(mu).add_(grad)
                if group['nesterov']:
                    grad = grad.add(buf, alpha=mu)   # g + μ * buf
                else:
                    grad = buf

                # 核心操作：msign（通过 Newton-Schulz 迭代）
                update = self._newton_schulz(grad, steps=group['ns_steps'])

                # 缩放更新量使 RMS ≈ 0.02（Match Adam Update RMS）
                # msign 输出的 RMS = 1/√max(m,n)，需要缩放到目标 RMS
                scale = max(1, p.size(0) / p.size(1)) ** 0.5
                update.mul_(scale)

                # 解耦权重衰减 + 参数更新
                p.mul_(1 - lr * wd)
                p.add_(update, alpha=-lr)
```

##### 实际使用：Muon + AdamW 混合

```python
def configure_optimizers(model, muon_lr=0.02, adam_lr=3e-4, wd=0.01):
    """典型的 Muon 使用方式：2D 权重用 Muon，其余用 AdamW"""
    muon_params = []
    adam_params = []

    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        # 2D 权重矩阵（排除 embedding 和 layernorm）用 Muon
        if param.ndim == 2 and 'embed' not in name and 'norm' not in name:
            muon_params.append(param)
        else:
            adam_params.append(param)

    optimizers = []
    if muon_params:
        optimizers.append(SimpleMuon(muon_params, lr=muon_lr, weight_decay=wd))
    if adam_params:
        optimizers.append(torch.optim.AdamW(adam_params, lr=adam_lr, weight_decay=wd))

    return optimizers

# 训练循环
optimizers = configure_optimizers(model)
for batch in dataloader:
    loss = model(batch)
    loss.backward()
    for opt in optimizers:
        opt.step()
    for opt in optimizers:
        opt.zero_grad()
```

#### 四、更新过程可视化对比

假设一个 $3 \times 3$ 的梯度矩阵，直观看四种优化器如何处理它：

```
梯度矩阵 G:          SVD 分解: G = U Σ V^T
┌─────────────┐      ┌───┐ ┌───────┐ ┌───┐
│ 6.0 2.0 1.0 │      │   │ │10 0 0 │ │   │
│ 3.0 7.0 2.0 │  =   │ U │ │ 0 3 0 │ │V^T│
│ 1.0 1.0 0.5 │      │   │ │ 0 0 1 │ │   │
└─────────────┘      └───┘ └───────┘ └───┘
                           奇异值: 10, 3, 1
                           F范数 = √(100+9+1) ≈ 10.49

──────────────────────────────────────────────────────────────

SGD 的更新方向（F范数归一化，梯度等比缩放）:
┌──────────────────────────────────────┐
│ 6/10.49  2/10.49  1/10.49            │   = 梯度 / ‖梯度‖_F
│ 3/10.49  7/10.49  2/10.49            │     每个元素等比例缩小
│ 1/10.49  1/10.49  0.5/10.49          │     保留了原始梯度的"形状"
└──────────────────────────────────────┘
  → 大元素(7.0)的更新量 = 小元素(0.5)的 14 倍
  → 各元素的相对比例完全保留，等价于 SVD 中奇异值等比缩放

──────────────────────────────────────────────────────────────

Adam/AdamW 的更新方向（逐元素，每个元素独立归一化）:
┌──────────────────────────────┐
│ sign(6) sign(2) sign(1)     │   ≈ 每个元素各自 ±1
│ sign(3) sign(7) sign(2)     │     （被 v_t 自适应缩放后
│ sign(1) sign(1) sign(0.5)   │      实际值在 ±1 附近）
└──────────────────────────────┘
  → 大元素(7.0)和小元素(0.5)的更新量几乎一样大
  → 每个元素被独立"归一化"，消除了元素间的大小差异

──────────────────────────────────────────────────────────────

Muon 的更新方向（矩阵级别，msign）:
┌─────────────┐     ┌───┐     ┌───┐
│             │     │   │ ┌─┐ │   │
│   U V^T     │  =  │ U │ │I│ │V^T│   奇异值全部变为 1
│             │     │   │ └─┘ │   │   结果是正交矩阵
└─────────────┘     └───┘     └───┘
  → 大奇异值(10)和小奇异值(1)统一变为1
  → 在矩阵"方向"层面均匀更新

══════════════════════════════════════════════════════════════

对比要点:
• SGD:       梯度等比缩放，保留原始形状
             大梯度元素更新大，小梯度元素更新小
             没有任何"均匀化"机制 → 容易被大梯度主导

• Adam/AdamW: 逐元素独立归一化 → 元素级公平
             每个参数有自己的有效学习率
             适合参数尺度差异大的场景（如 NLP 中的 embedding）

• Muon:       矩阵级归一化 → 奇异值方向公平
             弱方向(σ=1)被放大10倍，强方向(σ=10)被压缩10倍
             利用了矩阵的全局结构信息，比逐元素更"本质"
```
