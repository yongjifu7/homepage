---
title: "Learning Realistic Expressions for Humanoid Face Robots"
title_zh: "仿人面部机器人逼真表情学习"
authors:
  - "Yongji Fu"
  - "Rui Zhang"
  - "Zhenyu Xu"
  - "et al."
venue: "CVPR 2027"
venue_zh: "CVPR 2027"
year: 2025
date: 2025-09-15
thumbnail: "/videos/humanoid-face-expression.mp4"
status: "submitted"
featured: true
bibtex: |
  @unpublished{fu2025humanoidface,
    title={Learning Realistic Expressions for Humanoid Face Robots},
    author={Fu, Yongji and others},
    note={Manuscript in preparation; target venue: IEEE International Conference on Robotics and Automation (ICRA) 2026},
    year={2025}
  }
abstract_en: |
  For a humanoid face robot to appear approachable and believable in education, companionship, and
  performance settings, it needs to generate full-face dynamic expressions that engage the brows,
  eyes, lips, and cheeks. Existing systems typically treat the robot face as a downstream execution
  target of human facial animation, relying on low-dimensional expression parameters or pixel-video
  intermediates — which splits expression generation from physical execution: the former struggles
  to carry the diverse full-face motion that accompanies a single utterance, while the latter places
  the real robot under an out-of-distribution visual target and still requires extraction, smoothing,
  and mapping before it reaches the actuators. This work proposes a **text- and audio-driven,
  high-DoF-density biomimetic face-robot system**. On the hardware side, a **flexible tendon-sheath
  transmission network** decouples the servos from the facial actuation points, packing 34 servo
  actuators into a compact, approachable head only 19.5 cm tall. On the algorithm side, we learn a
  **robot-aware motion latent interface** and generate full-face motion directly in this space, so
  that text controls emotion and action semantics, audio constrains lip-sync, and robot image
  observations anchor the interface to the real hardware. The system avoids first generating pixel
  video or reconstructing the robot's face at inference time, reducing intermediate artifacts and
  extra latency. Experiments show the system generates natural, controllable speaking expressions
  and provides a unified interface for robot expression driving that stays stable across performers.
abstract_zh: |
  人形面部机器人若要在教育、陪伴和展演等场景中显得亲近可信，需要生成能调动眉眼、唇颊和头颈的全脸
  动态表情。现有系统常把机器人脸作为人脸动画的下游执行目标，依赖低维表情参数或像素视频中间量，
  从而把表情生成与物理执行割裂开来：前者难以承载同一语音下的多样全脸运动，后者又把真实机器人置
  于分布外视觉目标中，并需要再经过提取、平滑和映射才能落到执行器。本文提出一个**文本与音频驱动
  的高自由度密度仿生机械脸系统**。硬件上，**柔性腱鞘传动网络**将舵机与面部动作点解耦，在仅
  $19.5$ cm 高的亲和型头部内集成 $34$ 个舵机执行器。算法上，我们学习**机器人感知的运动潜在
  接口**，并直接在该空间生成全脸运动，使文本控制情绪与动作语义，音频约束唇形同步，机器人图像
  观测锚定真实硬件。该系统避免推理时先生成像素视频或重建机器人脸图像，减少中间伪影和额外延迟。
  实验表明，本系统能够生成自然、可控的说话表情，并为跨表演者稳定的机器人表情驱动提供统一接口。
body_zh: |
  ## 研究动机

  仿人面部机器人平台常在两个方向上失败：要么动作看起来很机械（物理上可行，但视觉上"死气沉沉"），
  要么学出来的控制器为了追求视觉逼真度，把硬件驱动到安全范围之外。我们想要的表情，既要"看起来像
  人"，又要"能在真实电机上跑起来"。

  ## 硬件平台

  <figure>
  <img src="/images/humanoid-robot-overview.png" alt="绳腱密集仿生机械脸硬件平台" />
  <figcaption><strong>绳腱密集仿生机械脸硬件平台。</strong> (a) 正视图；(b) 透明外壳侧视图，可见集中布置于颅壳的舵机库与经铜管走向面部的钢丝腱；(c)(d) 左右 3/4 视图。颈部由两台无刷电机经双推杆（两端鱼眼球铰）与 yaw 齿轮副驱动。</figcaption>
  </figure>

  ## 方法

  - **从人类参考重定向。** 把目标面部信号映射进机器人的执行器空间，并显式约束扭矩、行程范围，以及
    相邻自由度之间的耦合。
  - **学习式控制器。** 一个控制器预测执行器轨迹，同时复现目标表情的关键姿态与微动态，训练目标同时
    衡量视觉逼真度与物理可行性。
  - **闭环评估。** 模型部署在真实的机械面部硬件上，同时用客观运动指标和主观人工评分进行评估。

  ## 贡献

  - **高自由度密度仿生机械脸硬件。** 构建了一个采用柔性腱鞘传动网络的仿生头部，在 19.5 cm 高的
    小型头部空间内集成 34 个舵机执行器，使更接近女性角色比例的亲和外观也能承载细腻的全脸表情。
  - **机器人感知的运动潜在接口。** 把机器人图像观测纳入运动表征学习，使生成、视觉表演读取与执行
    器映射共享同一运动空间，避免把机器人仅仅当作像素视频或 blendshape 管线下游的 retargeting
    目标。
  - **运动潜在空间内的条件生成。** 在 motion latent 中用单一网络支持 T2V、A2V 与 TA2V 三种输入
    设置，并提供离线双向 Transformer 与流式自回归两个版本；推理时不经过像素视频中间目标，因此
    避免了视频伪影和额外的重建延迟。
  - **系统验证。** 打通"文本/音频 → 运动潜在 → 虚拟渲染 / 执行器"的完整链路，在生成质量、可控性、
    跨表演者一致性与机器人部署上给出实验验证。机器人端的定量评测（表情识别、唇/情顶点误差、用户
    研究）目前以占位结果标注，待真机闭环实验完成后替换。

  ## 视频

  <video src="/videos/humanoid-face-expression.mp4" poster="/videos/humanoid-face-expression.jpg" controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
---

## Motivation

Humanoid face platforms fail in two directions: either the motion looks mechanical (physically
valid but visually dead) or the learned controller drives the hardware outside its safe operating
envelope chasing visual realism. We want expressions that *look* human and *run* on real motors.

## Hardware

<figure>
<img src="/images/humanoid-robot-overview.png" alt="Tendon-sheath-dense biomimetic face-robot hardware platform" />
<figcaption><strong>Tendon-sheath-dense biomimetic face-robot hardware platform.</strong> (a) Front view; (b) Side view through the transparent shell, showing the servo bank concentrated in the cranial shell and the steel tendons routed to the face through copper tubes; (c)(d) left/right 3/4 views. The neck is driven by two brushless motors via a dual push-rod (with rod-end spherical bearings) and a yaw gear pair.</figcaption>
</figure>

## Approach

- **Retargeting from human reference.** Target facial signals are mapped into the robot's
  actuator space with explicit constraints for torque, range, and coupling between adjacent
  degrees of freedom.
- **Learned controller.** A controller predicts actuator trajectories that reproduce both the
  key pose and the micro-dynamics of a target expression, trained with objectives that jointly
  score perceptual fidelity and physical feasibility.
- **Closed-loop evaluation.** The model is deployed on the physical face hardware and evaluated
  on both objective motion metrics and subjective human judgment.

## Contributions

- **High-DoF-density biomimetic face hardware.** We build a biomimetic head with a flexible
  tendon-sheath transmission network, packing 34 servo actuators into a 19.5 cm-tall head, so an
  appearance closer to a compact, feminine proportion can still carry fine-grained, full-face
  expressions.
- **A robot-aware motion latent interface.** We fold robot image observations into
  motion-representation learning, so generation, visual performance read-out, and actuator mapping
  share the same motion space, instead of treating the robot merely as a downstream retargeting
  target of a pixel-video or blendshape pipeline.
- **Conditional generation inside the motion latent space.** A single network supports three input
  settings — T2V, A2V, and TA2V — inside the motion latent, with both an offline
  bidirectional-Transformer version and a streaming autoregressive version; inference never passes
  through a pixel-video intermediate, avoiding video artifacts and extra reconstruction latency.
- **System validation.** We close the full loop from text/audio to motion latent to virtual
  rendering / actuators, and provide experimental validation of generation quality, controllability,
  cross-performer consistency, and robot deployment. Robot-side quantitative evaluation (expression
  recognition, lip/emotion-vertex error, user study) is currently reported with placeholder results,
  to be replaced once the physical closed-loop experiments are complete.

## Video

<video src="/videos/humanoid-face-expression.mp4" poster="/videos/humanoid-face-expression.jpg" controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

