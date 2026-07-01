---
title: "TouchBridge: Multi-Bridge Alignment and Reversible Canonical Tactile Space for Cross-Sensor Robotic Manipulation"
title_zh: "TouchBridge：面向跨传感器机器人操作的多桥接对齐与可逆规范触觉空间"
authors:
  - "Yongji Fu"
  - "Guanqun Cao"
  - "Yi Zhou"
  - "et al."
venue: "ICRA 2026"
venue_zh: "ICRA 2026"
year: 2025
date: 2025-09-15
thumbnail: "/images/touchbridge-fig3-data-collection.png"
status: "submitted"
featured: true
bibtex: |
  @unpublished{fu2025touchbridge,
    title={TouchBridge: Multi-Bridge Alignment and Reversible Canonical Tactile Space for Cross-Sensor Robotic Manipulation},
    author={Fu, Yongji and others},
    note={Manuscript in preparation; target venue: IEEE International Conference on Robotics and Automation (ICRA) 2026},
    year={2025}
  }
abstract_en: |
  Optical tactile sensors differ widely in geometry, illumination, and readout, so a representation
  or policy learned on one sensor rarely transfers to another. This forces practitioners to
  re-collect data and re-train for every new fingertip. **TouchBridge** addresses this with a
  **reversible canonical tactile space**: a shared latent that any sensor can be mapped into and,
  crucially, mapped back out of, so tactile signals can be translated across heterogeneous sensors
  rather than merely embedded.

  Alignment is learned through **multi-bridge alignment** — instead of one monolithic encoder, each
  sensor connects to the canonical space through its own invertible bridge, and the bridges are
  trained jointly so that the canonical space stays sensor-agnostic while remaining decodable back
  to each native sensor domain. This lets a manipulation policy or representation trained on one
  sensor operate on another with little or no new tactile data.

  We evaluate on cross-sensor manipulation, transferring tactile representations and contact-driven
  control across sensors, and show that the reversible canonical space preserves the contact
  information needed for downstream manipulation while enabling sensor-to-sensor translation.
abstract_zh: |
  光学触觉传感器在几何形态、光照和读出方式上差异很大，因此在某个传感器上学到的表示或策略往往
  无法迁移到另一个传感器，导致每换一个指尖就要重新采集数据、重新训练。**TouchBridge** 通过一个
  **可逆的规范触觉空间**来解决这一问题：任意传感器都可以被映射进这一共享潜空间，并且关键在于还能
  从中映射回来，使触觉信号能够在异构传感器之间相互转换，而不仅仅是被嵌入其中。

  对齐通过**多桥接对齐（multi-bridge alignment）**学习——不使用单一的庞大编码器，而是让每个
  传感器各自通过一个可逆的桥连接到规范空间，并对这些桥进行联合训练，使规范空间保持与传感器
  无关，同时又能解码回各自的原生传感器域。这样，在某一传感器上训练的操作策略或表示就能在另一个
  传感器上运行，几乎不需要新的触觉数据。

  我们在跨传感器操作任务上进行评估，将触觉表示与基于接触的控制在不同传感器间迁移，结果表明可逆
  的规范空间既保留了下游操作所需的接触信息，又实现了传感器到传感器的转换。
body_en: |
  ## Motivation

  An optical tactile image is not a natural photograph — it's a physical contact event rendered
  through a specific sensor's gel, illumination, and marker layout. The same press, slide, or load
  change looks completely different once it passes through a different sensor's optics and
  calibration. This rendering gap is why cross-sensor tactile learning can't just mean "use a
  bigger shared encoder": a large enough encoder will happily learn to recognize *which sensor*
  produced an image before it learns *what contact happened*, and a representation built that way
  is stuck on the sensor it was trained on.

  ## Bridges: what prior work actually aligns on

  We found it useful to describe existing cross-sensor tactile methods by what supervision they use
  to pin heterogeneous observations to the same underlying contact — a **bridge**. Four kinds show
  up in the literature, each strong somewhere and narrow somewhere else:

  - **Force bridges** (e.g. UniForce) press two sensors under matching quasi-static force
    equilibrium, so the physics — not sensor appearance — guarantees the pair corresponds to the
    same contact. This gives a strong physical anchor, but a low-dimensional one: it says little
    about contact events or object semantics, and it depends on the indentation staying quasi-static.
  - **Task-label bridges** (T3, UniT, Sparsh, AnyTouch/AnyTouch2) put many sensors through one
    shared encoder trained on material, slip, pose, or reconstruction objectives. This scales across
    datasets, but the resulting representation is usually discriminative and one-directional — you
    can read off a label, but you can't ask what a *different* sensor would have seen.
  - **Cross-modal bridges** (UniTouch, TVL/TLV-CoRe) align touch with vision, language, or audio,
    which is exactly what lets a model connect touch to high-level semantics like "hammer" vs.
    "apple." Semantic alignment isn't the same thing as sensor disentanglement, though — an
    embedding can be retrievable by text and still carry a strong sensor-specific signature.
  - **Translation bridges** (Touch2Touch, GenForce) map one sensor's appearance directly onto
    another's, which is the closest existing idea to reversibility. In practice this tends to mean
    training a new translator per sensor pair, so it doesn't scale combinatorially and the
    translated data usually has to be fed back into a fresh downstream model.

  ## A portfolio of bridges, not one

  TouchBridge's position is that none of these bridges is wrong, they're just individually narrow —
  so instead of betting on one, we let force and delta-force, contact geometry, discrete actions,
  load sequences, simulator-shared state, and cross-sensor pairing supervise the *same* space
  jointly, weighted by how reliable each signal actually is.

  That shared space, which we call **TacCanon**, is defined by what it excludes rather than what it
  contains: the only thing pushed out is sensor identity. Everything sensors have in common — force
  and contact dynamics, actions and events, object and material semantics, anything alignable across
  modalities — is kept. Because identity is factored out into its own swappable component instead of
  discarded, the same contact content can be re-rendered as if any target sensor had observed it:
  cross-sensor transfer becomes translation through a shared space, not a one-way embedding, and it
  doesn't require training a new bridge per sensor pair.

  <figure>
  <img src="/images/touchbridge-fig3-data-collection.png" alt="Quasi-static force-equilibrium pairing rig from Chen et al., UniForce" />
  <figcaption><strong>Figure adapted from Chen et al., &ldquo;UniForce&rdquo; (arXiv:2602.01153).</strong> Two sensors are pressed under matching quasi-static force equilibrium so their frames are guaranteed to correspond to the same physical contact rather than merely a visually similar one — the force bridge described above. TouchBridge keeps this bridge as one source of supervision among several, rather than defining the canonical space as force alone.</figcaption>
  </figure>

  ## Results

  Evaluated across three optical tactile sensors (GelSight, GelSight Mini, DIGIT) and nine public
  datasets, TouchBridge's canonical representation reaches **77.0%** on the TAG material-recognition
  benchmark and **42.3%** on Cloth — both state of the art among the methods we compare against —
  with **86.7** and **98.0** F1 on slip detection across two evaluation settings. On real-robot
  manipulation, policies built on top of the canonical representation reach **0.80** grasping,
  **0.85** wiping, and **0.85** chip-relocation success, outperforming both single-sensor baselines
  and encoders trained without cross-sensor alignment.

  ## Why reversibility matters downstream

  Because TacCanon is sensor-agnostic by construction, a manipulation policy sitting on top of it
  never needs to know which sensor produced its input — swapping a fingertip becomes a matter of
  re-fitting a small identity component, not retraining the policy.

  <figure>
  <img src="/images/touchbridge-fig7-vla.png" alt="Force-aware tactile token plugged into a vision-language-action model, from Chen et al., UniForce" />
  <figcaption><strong>Figure adapted from Chen et al., &ldquo;UniForce&rdquo; (arXiv:2602.01153).</strong> A frozen force-aware tactile encoder turns heterogeneous sensor inputs into a single token that is fed into a vision-language-action model's action decoder alongside image and text tokens — the interface a language instruction like &ldquo;gently wipe the words on the whiteboard&rdquo; is executed against. TouchBridge targets the same kind of interface: a canonical token a policy can consume without caring which sensor produced it, which is what the wiping success rate above is evaluated on.</figcaption>
  </figure>
body_zh: |
  ## 研究动机

  光学触觉图像不是普通照片，而是一次物理接触，经由某个具体传感器的凝胶、光照和标记点布局渲染出来
  的观测。同一次按压、滑动或载荷变化，换一种传感器的光路和标定，看起来会完全不同。这个渲染差异，
  正是跨传感器触觉学习不能简单靠"用一个更大的共享编码器"解决的原因——足够大的编码器很乐意先学会
  认出"这是哪个传感器拍的"，再去学"发生了什么接触"，而这样学出来的表示，天然被锁死在训练它的
  那个传感器上。

  ## 桥：现有工作到底把什么对齐到了一起

  我们发现，用"桥"来描述现有跨传感器触觉方法很有用——桥是把异构传感器观测钉到同一次接触上的监督
  锚点。文献里大致有四类桥，各有所长，也各有边界：

  - **力桥**（如 UniForce）让两个传感器在匹配的准静态力平衡条件下压入，物理规律本身保证两侧观测
    对应同一次接触，而不只是视觉上相似。这是很强的物理锚点，但维度低：对接触事件、物体语义几乎
    没有覆盖，而且依赖压入过程保持准静态。
  - **任务标签桥**（T3、UniT、Sparsh、AnyTouch/AnyTouch2）把多个传感器数据放进同一个共享编码器，
    用材质、滑移、姿态或重建等任务训练。这类方法可以跨数据集规模化，但学出的表示通常是判别式、
    单向的——能读出标签，却答不出"换一个传感器会看到什么"。
  - **跨模态桥**（UniTouch、TVL/TLV-CoRe）把触觉与视觉、语言或音频对齐，这正是让模型把触觉和
    "锤子"或"苹果"这类高层语义联系起来的关键。但语义对齐不等于传感器解耦——一个能被文字检索到的
    embedding，仍然可能携带很强的传感器风格。
  - **翻译桥**（Touch2Touch、GenForce）把一个传感器的外观直接映射成另一个传感器的样子，是现有
    工作里最接近"可逆"的思路。但实践中往往要为每一对传感器单独训练翻译器，组合数量爆炸，翻译出的
    数据通常还要重新喂给一个新的下游模型。

  ## 桥的组合，而不是押单桥

  TouchBridge 的立场是：这些桥都没错，只是各自太窄——与其押一座桥，不如让力与增量力、接触几何、
  离散动作、载荷序、仿真共享状态和跨传感器配对，按各自监督信号的可靠程度，共同约束同一个空间。

  这个共享空间——我们称之为 **TacCanon**——由它排除了什么来定义，而不是它装了什么：唯一被排除的
  是传感器身份。传感器之间共有的一切——力与接触动态、动作与事件、物体与材质语义、任何可跨模态对齐
  的信息——都被保留下来。因为身份被单独剥离成一个可替换的分量，而不是被直接丢弃，同一次接触内容
  就能被"重新渲染"成任意目标传感器本该看到的样子：跨传感器迁移由此变成经过共享空间的"翻译"，而
  不是单向嵌入，也不需要为每一对传感器单独训练一座桥。

  <figure>
  <img src="/images/touchbridge-fig3-data-collection.png" alt="来自 Chen 等人 UniForce 论文的准静态力平衡配对装置" />
  <figcaption><strong>图片改编自 Chen 等人的论文&ldquo;UniForce&rdquo;（arXiv:2602.01153）。</strong>两个传感器在匹配的准静态力平衡条件下压入，保证两侧的帧对应同一次物理接触，而不只是视觉上相似——这正是上文提到的力桥。TouchBridge 把这类监督保留为多个信号来源之一，而不是把规范空间直接定义为纯力 latent。</figcaption>
  </figure>

  ## 结果

  在 3 种光学触觉传感器（GelSight、GelSight Mini、DIGIT）与 9 个公开数据集上评测，TouchBridge 的
  规范表征在材质识别基准 TAG 上达到 **77.0%**、在 Cloth 上达到 **42.3%**——均为对比方法中的最优；
  滑动检测在两种评测设置下分别达到 **86.7** 与 **98.0** F1。在真机操作任务上，基于规范表征构建的
  策略取得抓取 **0.80**、擦拭 **0.85**、薯片移动 **0.85** 的成功率，全面优于单传感器基线与未做
  跨传感器对齐的基线。

  ## 可逆性为什么重要

  由于 TacCanon 在设计上与传感器无关，架在它之上的操作策略完全不需要知道输入来自哪个传感器——换
  一个指尖，只需要重新拟合一个很小的身份分量，而不必重新训练整个策略。

  <figure>
  <img src="/images/touchbridge-fig7-vla.png" alt="来自 Chen 等人 UniForce 论文，力感知触觉 token 接入视觉-语言-动作模型" />
  <figcaption><strong>图片改编自 Chen 等人的论文&ldquo;UniForce&rdquo;（arXiv:2602.01153）。</strong>一个冻结的力感知触觉编码器，把异构传感器输入统一成一个 token，与图像、文本 token 一起送入视觉-语言-动作模型的动作解码器——这也是"轻轻擦掉白板上的字"这类语言指令被解析、执行的接口。TouchBridge 追求的是同一类接口：一个策略可以直接消费、不必关心来自哪个传感器的规范 token，这正是上文擦拭成功率的评测场景。</figcaption>
  </figure>
---
