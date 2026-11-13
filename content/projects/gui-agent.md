---
title: "Computer-Use GUI Agent: Post-Training and Self-Evolving Evaluation"
title_zh: "Computer Use / GUI Agent：后训练与自进化评测"
summary: "Post-training and evaluation for a computer-use agent that runs multi-step workflows on real web and desktop interfaces. On Qwen2.5-VL-7B-Instruct, an SFT → offline step-RFT → online GiGPO pipeline lifts success on a 200-task expert-solution benchmark from 31.3% to 49.2%. A trace-based LLM-as-Judge evaluator agrees with human labels 94.3% of the time (83.2% on complex tasks) and drives a self-evolving benchmark."
summary_zh: "面向真实网页与桌面端多步业务流程的 Computer Use / GUI Agent 后训练与评测。基于 Qwen2.5-VL-7B-Instruct 构建 SFT → 离线 step-RFT → 在线 GiGPO 后训练流程，200 条专家解法 benchmark 成功率由 31.3% 提升至 49.2%；trace 级 LLM-as-Judge 自动评测与人工标注一致率 94.3%（复杂任务 83.2%），并驱动题库自进化。"
date: 2026-03-01
stack: ["GUI Agent", "Qwen2.5-VL", "SFT", "GRPO", "GiGPO", "DAPO", "LLM-as-Judge"]
featured: true
order: 0
thumbnail: "/images/gui-agent-overview.svg"
body_zh: |
  <figure>
  <img src="/images/gui-agent-overview.svg" alt="GUI Agent 后训练流程与自进化评测闭环" />
  <figcaption>上：SFT → 离线 step-RFT → 在线 GiGPO 三阶段后训练；下：trace 自动评测 → 题库自进化的闭环。</figcaption>
  </figure>

  ## 问题

  面向网页与桌面端的业务流程自动化，GUI Agent 需要在真实界面上完成检索、填写、跨页面操作与结果
  提交等多步任务，对**操作正确性、异常恢复和长流程稳定性**要求很高，基础模型难以直接达到可用水平。
  与此同时，任务类型、页面状态与操作路径持续变化，人工逐题验收成本高，难以及时发现能力边界、覆盖
  薄弱场景。项目因此分两条线：**把模型训好**（后训练），以及**把模型测准**（自动评测与题库自进化）。

  ## 一、后训练：SFT → 离线 step-RFT → 在线 GiGPO

  **多源 SFT 轨迹与配比。** 构建四类轨迹生产链路：教师轨迹、switch-policy 纠错轨迹、hint 引导
  rollout（后处理改写为 CoT）与拒绝采样，并通过配比实验确定数据组合；仅纯教师轨迹 SFT 就带来
  **9.7%** 的提升。

  **switch-policy 纠错轨迹。** 弱策略先执行错误动作，强策略接管并完成纠正，补足"失败—恢复"场景。
  对已被纠正的错误 step 屏蔽 loss，避免模型模仿错误动作：

  $$
  \mathcal{L}_{\mathrm{SFT}}(\theta) = -\frac{1}{\sum_t m_t}\sum_{t} m_t \log \pi_\theta\!\left(a_t \mid s_t, h_{<t}\right),
  \qquad m_t = \mathbb{I}\!\left[\,t \notin \mathcal{T}_{\mathrm{err}}\,\right]
  $$

  其中 $h_{<t}$ 为历史上下文，$\mathcal{T}_{\mathrm{err}}$ 为弱策略执行、随后被纠正的错误步。

  **离线 step-level GRPO（step-RFT）。** 固定轨迹上下文 $(s_t, h_{<t})$，对单步原子动作采样 $G$ 个
  候选，组内做 GRPO。优势沿用 DeepSeekMath 的组归一化形式：

  $$
  \hat{A}_{i} = \frac{r_{i} - \mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})},
  \qquad \mathbf{r} = \{r_1, \dots, r_G\}
  $$

  规则 verifier 按**格式、动作类型、参数**三阶段打分；click 动作的参数奖励在 golden bbox
  $B^{\star}$ 内记为 1，框外随距离单调衰减（示意）：

  $$
  r_{\mathrm{click}}(p) =
  \begin{cases}
  1, & p \in B^{\star} \\[2pt]
  g\!\left(d(p, B^{\star})\right), & p \notin B^{\star}
  \end{cases}
  \qquad g(0)=1,\; g \downarrow
  $$

  以纠错轨迹占比较高的 SFT checkpoint 初始化，step-RFT 再带来 **4%** 增益。

  **可验证的细粒度奖励。** 以任务 **progress** 为主项，叠加 side-effect、false-complete、
  post-success-abort 与 overdue 惩罚（示意）：

  $$
  R = r_{\mathrm{progress}}
  - \lambda_{\mathrm{se}}\,\mathbb{I}_{\mathrm{side\text{-}effect}}
  - \lambda_{\mathrm{fc}}\,\mathbb{I}_{\mathrm{false\text{-}complete}}
  - \lambda_{\mathrm{psa}}\,\mathbb{I}_{\mathrm{post\text{-}success\text{-}abort}}
  - \lambda_{\mathrm{od}}\,\mathbb{I}_{\mathrm{overdue}}
  $$

  并对 AnswerSheet 错答做**伪完成校正**，抑制模型通过虚假"已完成"状态获取奖励。

  **在线 GiGPO 两级优势 + DAPO clip-higher。** GiGPO 在两个层级上做组内归一化。episode 级
  按同一任务的 $N$ 条轨迹分组：

  $$
  A^{E}(\tau_{i})=\frac{R(\tau_{i})-\mathrm{mean}\bigl(\{R(\tau_{j})\}_{j=1}^{N}\bigr)}{F_{\mathrm{norm}}\bigl(\{R(\tau_{j})\}_{j=1}^{N}\bigr)}
  $$

  step 级把不同轨迹中处于**同一状态** $\tilde{s}$ 的步骤归为一组——本项目以 **action-prefix**
  标识状态——并用折扣回报 $R_t^{(i)}=\sum_{k=t}^{T}\gamma^{\,k-t} r_k^{(i)}$ 计算组内优势：

  $$
  A^{S}(a_{t}^{(i)})=\frac{R_{t}^{(i)}-\mathrm{mean}\bigl(\{R_{t}^{(j)} \mid (a_{t}^{(j)},R_{t}^{(j)})\in\mathcal{G}^{S}(\tilde{s})\}\bigr)}{F_{\mathrm{norm}}\bigl(\{R_{t}^{(j)} \mid (a_{t}^{(j)},R_{t}^{(j)})\in\mathcal{G}^{S}(\tilde{s})\}\bigr)},
  \qquad
  A(a_{t}^{(i)})=A^{E}(\tau_{i})+\omega\, A^{S}(a_{t}^{(i)})
  $$

  策略更新采用 DAPO 的非对称裁剪（clip-higher, $\varepsilon_{\mathrm{high}} > \varepsilon_{\mathrm{low}}$），
  给低概率但有益的动作留出上升空间：

  $$
  \mathcal{J}(\theta)=\mathbb{E}\Bigg[\frac{1}{NT}\sum_{i=1}^{N}\sum_{t=1}^{T}
  \min\Big(\rho_{\theta}(a_{t}^{(i)})\,A(a_{t}^{(i)}),\;
  \mathrm{clip}\big(\rho_{\theta}(a_{t}^{(i)}),\,1-\varepsilon_{\mathrm{low}},\,1+\varepsilon_{\mathrm{high}}\big)\,A(a_{t}^{(i)})\Big)\Bigg],
  \qquad
  \rho_{\theta}(a_{t}^{(i)})=\frac{\pi_{\theta}(a_{t}^{(i)}\mid s_{t}^{(i)},x)}{\pi_{\theta_{\mathrm{old}}}(a_{t}^{(i)}\mid s_{t}^{(i)},x)}
  $$

  相比轨迹级 GRPO，两级优势实现了更细粒度的 credit assignment。

  ## 二、自动评测与 Benchmark 自进化

  构建「**trace 自动评测 → 题库自进化**」闭环：将任务拆解为**原子评分点（point）**，以
  **LLM-as-Judge** 自动完成逐条判定，并按任务类型路由到简单 / 复杂两类评测链路。

  - **窗口化 point 判定与复杂任务核验。** 按时间顺序把 trace 切成**证据窗口**，批量判定各窗口
    中的评分点并分组聚合得分。信息检索类任务只抽取智能体**实际可观测的页面事实**，识别"答案正确
    但证据来源虚构"的情形；循环类任务逐窗抽取操作实体、**跨步骤去重**并核验执行次数，降低漏计与
    重复计数风险。
  - **Benchmark 自进化。** 设计**四类变异算子**，沿解题链把种子任务改造成更难的新任务；基于真实
    设备执行 trace 构建**能力约束**，保证新任务功能上可实现。候选任务经**真实设备可达性验证与
    独立复核**后写入题库，形成可持续扩展的评测机制。

  ## 结果

  | 指标 | 结果 |
  |---|---|
  | 200 条专家解法 benchmark 成功率 | **31.3% → 49.2%**（SFT → step-RFT → GiGPO） |
  | 纯教师轨迹 SFT 增益 | **+9.7%** |
  | step-RFT 增益 | **+4%** |
  | LLM-as-Judge 与人工标注一致率 | **94.3%**（复杂任务 **83.2%**） |

  公式参考：GRPO 见 DeepSeekMath（Shao et al., 2024），GiGPO 见 Feng et al., 2025，DAPO 见
  Yu et al., 2025；标注"示意"的公式为本项目设计的结构化表达，具体系数从略。
---

<figure>
<img src="/images/gui-agent-overview.svg" alt="GUI agent post-training pipeline and self-evolving evaluation loop" />
<figcaption>Top: three-stage post-training, SFT → offline step-RFT → online GiGPO. Bottom: the trace evaluation → benchmark self-evolution loop.</figcaption>
</figure>

## Problem

Automating business workflows on web and desktop interfaces means a GUI agent has to search, fill
forms, move across pages, and submit results over many steps, with high demands on **action
correctness, error recovery, and long-horizon stability** — a base model is far from usable out of
the box. At the same time, task types, page states, and action paths keep changing, so manual
task-by-task review is expensive and slow to reveal capability gaps. The project therefore has two
halves: **training the agent** (post-training) and **measuring it reliably** (automatic evaluation
with a self-evolving benchmark).

## 1. Post-training: SFT → offline step-RFT → online GiGPO

**Multi-source SFT trajectories and mixing.** Four trajectory pipelines — teacher trajectories,
switch-policy correction trajectories, hint-guided rollouts (rewritten into CoT afterwards), and
rejection sampling — with mixing experiments to choose the data blend. Teacher-only SFT alone
gives a **9.7%** gain.

**Switch-policy correction trajectories.** A weak policy first takes a wrong action, then a strong
policy takes over and corrects it, covering fail-and-recover situations. The loss is masked on the
erroneous steps that were later corrected, so the model does not imitate them:

$$
\mathcal{L}_{\mathrm{SFT}}(\theta) = -\frac{1}{\sum_t m_t}\sum_{t} m_t \log \pi_\theta\!\left(a_t \mid s_t, h_{<t}\right),
\qquad m_t = \mathbb{I}\!\left[\,t \notin \mathcal{T}_{\mathrm{err}}\,\right]
$$

where $h_{<t}$ is the interaction history and $\mathcal{T}_{\mathrm{err}}$ the weak-policy steps
that were subsequently corrected.

**Offline step-level GRPO (step-RFT).** With the trajectory context $(s_t, h_{<t})$ frozen, $G$
candidates are sampled for a single atomic action and optimized with GRPO, using the
group-normalized advantage from DeepSeekMath:

$$
\hat{A}_{i} = \frac{r_{i} - \mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})},
\qquad \mathbf{r} = \{r_1, \dots, r_G\}
$$

A rule-based verifier scores **format, action type, and arguments** in three stages; a click
earns 1 inside the golden box $B^{\star}$ and decays with distance outside it (schematic):

$$
r_{\mathrm{click}}(p) =
\begin{cases}
1, & p \in B^{\star} \\[2pt]
g\!\left(d(p, B^{\star})\right), & p \notin B^{\star}
\end{cases}
\qquad g(0)=1,\; g \downarrow
$$

Initialized from the SFT checkpoint with the highest share of correction trajectories, step-RFT
adds a further **4%**.

**Verifiable fine-grained reward.** Task **progress** is the main term, with penalties for side
effects, false completion, aborting after success, and overrunning the step budget (schematic):

$$
R = r_{\mathrm{progress}}
- \lambda_{\mathrm{se}}\,\mathbb{I}_{\mathrm{side\text{-}effect}}
- \lambda_{\mathrm{fc}}\,\mathbb{I}_{\mathrm{false\text{-}complete}}
- \lambda_{\mathrm{psa}}\,\mathbb{I}_{\mathrm{post\text{-}success\text{-}abort}}
- \lambda_{\mathrm{od}}\,\mathbb{I}_{\mathrm{overdue}}
$$

A **false-completion correction** on wrong AnswerSheet answers stops the agent from collecting
reward by merely claiming to be done.

**Online GiGPO two-level advantages + DAPO clip-higher.** GiGPO normalizes at two levels. At the
episode level, the $N$ trajectories of the same task form a group:

$$
A^{E}(\tau_{i})=\frac{R(\tau_{i})-\mathrm{mean}\bigl(\{R(\tau_{j})\}_{j=1}^{N}\bigr)}{F_{\mathrm{norm}}\bigl(\{R(\tau_{j})\}_{j=1}^{N}\bigr)}
$$

At the step level, steps from different trajectories that share the **same state** $\tilde{s}$ —
identified here by the **action prefix** — form a group, scored with the discounted return
$R_t^{(i)}=\sum_{k=t}^{T}\gamma^{\,k-t} r_k^{(i)}$:

$$
A^{S}(a_{t}^{(i)})=\frac{R_{t}^{(i)}-\mathrm{mean}\bigl(\{R_{t}^{(j)} \mid (a_{t}^{(j)},R_{t}^{(j)})\in\mathcal{G}^{S}(\tilde{s})\}\bigr)}{F_{\mathrm{norm}}\bigl(\{R_{t}^{(j)} \mid (a_{t}^{(j)},R_{t}^{(j)})\in\mathcal{G}^{S}(\tilde{s})\}\bigr)},
\qquad
A(a_{t}^{(i)})=A^{E}(\tau_{i})+\omega\, A^{S}(a_{t}^{(i)})
$$

The policy update uses DAPO's asymmetric clipping (clip-higher,
$\varepsilon_{\mathrm{high}} > \varepsilon_{\mathrm{low}}$), leaving room for low-probability but
useful actions to grow:

$$
\mathcal{J}(\theta)=\mathbb{E}\Bigg[\frac{1}{NT}\sum_{i=1}^{N}\sum_{t=1}^{T}
\min\Big(\rho_{\theta}(a_{t}^{(i)})\,A(a_{t}^{(i)}),\;
\mathrm{clip}\big(\rho_{\theta}(a_{t}^{(i)}),\,1-\varepsilon_{\mathrm{low}},\,1+\varepsilon_{\mathrm{high}}\big)\,A(a_{t}^{(i)})\Big)\Bigg],
\qquad
\rho_{\theta}(a_{t}^{(i)})=\frac{\pi_{\theta}(a_{t}^{(i)}\mid s_{t}^{(i)},x)}{\pi_{\theta_{\mathrm{old}}}(a_{t}^{(i)}\mid s_{t}^{(i)},x)}
$$

Compared with trajectory-level GRPO, the two-level advantage gives much finer-grained credit
assignment.

## 2. Automatic evaluation and a self-evolving benchmark

A closed loop of **trace evaluation → benchmark self-evolution**: each task is decomposed into
**atomic scoring points**, judged one by one by an **LLM-as-Judge**, and routed to a simple or a
complex evaluation path by task type.

- **Windowed point judging and complex-task checks.** The trace is cut chronologically into
  **evidence windows**; points are judged in batches per window and aggregated by group. For
  information-seeking tasks, only page facts the agent **actually observed** are extracted, catching
  answers that are right but whose evidence was invented. For looping tasks, the entities acted on
  are extracted per window, **deduplicated across steps**, and the execution count is checked,
  avoiding both missed and double counts.
- **Benchmark self-evolution.** **Four mutation operators** turn seed tasks into harder ones along
  the solution chain; **capability constraints** built from real-device traces keep every new task
  achievable. Candidates are written into the benchmark only after **real-device reachability
  checks and independent review**, so the benchmark keeps growing on its own.

## Results

| Metric | Result |
|---|---|
| Success on the 200-task expert-solution benchmark | **31.3% → 49.2%** (SFT → step-RFT → GiGPO) |
| Gain from teacher-only SFT | **+9.7%** |
| Gain from step-RFT | **+4%** |
| LLM-as-Judge agreement with human labels | **94.3%** (complex tasks **83.2%**) |

Formula references: GRPO from DeepSeekMath (Shao et al., 2024), GiGPO from Feng et al. (2025), and
DAPO from Yu et al. (2025). Equations marked "schematic" are structured descriptions of this
project's design, with coefficients omitted.
