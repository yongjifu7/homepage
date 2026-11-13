---
title: "ROSE: A Shared Cross-Embodiment Facial-Motion Latent Space for Humanoid Robot Expression"
title_zh: "ROSE：面向仿人机器人表情的跨具身共享面部运动潜空间"
authors:
  - "Yongji Fu"
  - "Man Cao"
  - "Yi Zhou"
  - "Fei Lin"
  - "Mark F. Hansen"
  - "Guanqun Cao"
venue: "ICRA 2027"
venue_zh: "ICRA 2027"
year: 2026
date: 2025-09-15
thumbnail: "/videos/humanoid-face-expression.mp4"
status: "submitted"
featured: true
bibtex: |
  @unpublished{fu2026rose,
    title={ROSE: A Shared Cross-Embodiment Facial-Motion Latent Space for Humanoid Robot Expression},
    author={Fu, Yongji and Cao, Man and Zhou, Yi and Lin, Fei and Hansen, Mark F. and Cao, Guanqun},
    note={Submitted to IEEE International Conference on Robotics and Automation (ICRA)},
    year={2026}
  }
abstract_en: |
  Natural, coherent full-face dynamic expressions are central to making humanoid robots socially
  approachable, yet existing systems commonly realize only limited lip motion or scripted
  expressions. The limitation is both physical and algorithmic: a compact head leaves little room
  for densely packed, independently controllable actuation, while learned systems often generate an
  avatar video, landmarks, or facial parameters and then infer actuator commands through visual
  retargeting — a render-and-invert path that adds latency and artifacts and does not reliably
  transfer generated behavior to a physical robot. We present **ROSE** (RObot facial expression
  through Shared motion Embeddings), a framework that integrates biomimetic hardware,
  cross-embodiment motion representation learning, and multimodal motion generation. **On the
  hardware side**, a flexible tendon-sheath transmission integrates **34 actuators into a 19.5 cm
  biomimetic head**; by decoupling actuator placement from facial action points, it enables
  coordinated full-face expression within a compact volume. **On the algorithmic side**,
  **ROSE-VAE** learns an identity-independent shared facial-motion latent space from human,
  digital-human, and robot observations; **ROSE-Flow** maps text, audio, or both directly to
  trajectories in this space without using video as a generator input; and **ROSE-Act** converts
  these trajectories into constrained actuator commands.
abstract_zh: |
  自然、连贯的全脸动态表情是让仿人机器人显得亲和可信的关键，但现有系统大多只能实现有限的唇部
  运动或预设脚本表情。这一局限同时来自物理与算法两方面：紧凑的头部空间难以容纳密集且可独立
  控制的执行器；而学习式系统通常先生成虚拟人视频、关键点或面部参数，再通过视觉重定向反推执行器
  指令——这种"先渲染、再反解"的路径会引入额外延迟与伪影，也难以把生成的行为可靠地迁移到真实
  机器人上。我们提出 **ROSE**（RObot facial expression through Shared motion Embeddings），
  一个融合仿生硬件、跨具身运动表征学习与多模态运动生成的框架。**硬件上**，柔性腱鞘传动结构在
  **19.5 cm 高的仿生头部内集成 34 个执行器**，将执行器布置与面部动作点解耦，在紧凑体积内实现
  协调的全脸表情。**算法上**，**ROSE-VAE** 从真人、数字人与机器人观测中学习与身份无关的共享
  面部运动潜空间；**ROSE-Flow** 以文本、音频或二者组合为条件，直接在该空间中生成运动轨迹，
  生成器不以视频为输入；**ROSE-Act** 再把这些轨迹转换为满足约束的执行器指令。
body_zh: |
  ## 概览

  <figure>
  <img src="/images/rose-overview.jpg" alt="ROSE 概览" />
  <figcaption><strong>图 1：ROSE 概览。</strong> ROSE-VAE 将真人、数字人与机械脸观测映射到共享的面部运动潜空间；ROSE-Flow 由文本和/或音频生成运动潜轨迹，ROSE-Act 再将其映射为真实机器人的执行器动作。右侧展示实时交互、人到机器人表情重定向，以及文本/音频到表情三类应用。</figcaption>
  </figure>

  ## 机器人平台

  平台共容纳 34 个用于面部表情与颈部运动的执行器，结合柔性腱鞘传动与局部刚性机构：执行器集中
  布置在头部顶部与后部，腱绳走向眉毛、眼睑、脸颊与嘴唇；局部连杆、推杆与转轴另外驱动下颌、
  嘴角、人中与眼球；颈部支持俯仰、侧倾与偏航三个自由度。

  <figure>
  <img src="/images/rose-hardware.jpg" alt="ROSE 机器人平台：腱鞘传动与执行器布局" />
  <figcaption><strong>机器人平台。</strong> (a) 整机装配；(b) 眉毛与脸颊驱动线；(c) 眼部模块（眼球俯仰执行器、眼睑推杆）；(d) 嘴部模块（下颌驱动杆、上/下唇连杆）；(e) 颈部模块（偏航执行器与成对俯仰执行器）。</figcaption>
  </figure>

  ## 方法

  - **ROSE-VAE：身份—运动解耦。** 身份编码器与运动编码器分别提取身份潜变量与逐帧运动系数，运动
    系数经一组共享、带正交正则的可学习运动基投影后与身份潜变量相加，再由解码器重建。真人、数字人
    与机器人三类观测共享同一编码器、运动基与解码器，并用面部局部掩码的感知损失保住唇、眼、眉的
    细微表情。
  - **ROSE-Flow：文本—音频条件运动生成。** 双流 MMDiT 在运动潜空间中做 flow matching：文本提供
    全局意图与表情风格，音频经 Wav2Vec 2.0 提取后以**帧局部音频窗口注意力**约束每一帧的口型时序。
    训练上采用**渐进式模态统一**：先做音频到运动（A2M）预训练，再以其初始化做文本到运动（T2M）
    适配，合并两组权重后联合训练，得到同时支持 A2M、T2M 与 TA2M 的统一模型。
  - **ROSE-Act：潜变量到执行器。** 通过安全的电机随机探索（motor babbling）采集机器人图像与执行
    器状态的同步数据对，用 ROSE-VAE 提取运动系数后训练潜变量到执行器的映射；推理时结合标定、关节
    限位与速率限制输出约束后的指令，全程无需中间图像重建。

  <figure>
  <img src="/images/rose-method.jpg" alt="ROSE-Flow 架构" />
  <figcaption><strong>ROSE-Flow 架构。</strong> (a) 文本—运动双流 MMDiT，训练时使用冻结的 ROSE-VAE 编码器，生成的运动潜变量经 Latent-to-Servo 映射为真实机器人指令，解码人脸仅用于可视化；(b) 音频窗口注意力：每个运动帧只关注其局部窗口内的音频 token；(c) 渐进式模态统一：A2M 预训练 → T2M 适配 → 权重合并 → 联合训练。</figcaption>
  </figure>

  ## 主要结果

  - **跨身份运动表征：** 在 24 组跨身份重演任务上，ROSE-VAE 的目标身份相似度 CSIM-T 为 0.741
    （FLOAT VAE 为 0.730），头部姿态误差 APD 为 1.26°（对比 1.35°）。
  - **说话人脸生成：** 在 HDTF / RAVDESS 上 FID 与 FVD 均为最优（FVD 54.6 / 56.8，最强基线
    FLOAT 为 70.2 / 81.8），两个数据集的 LSE-D 均最低（9.785 / 7.298）。
  - **真机唇形：** 三段 RAVDESS 测试语句上，ROSE 的唇部潜码 MSE 均为最低，例如 Speech 1 由
    RIT 的 0.0202 降至 0.0158。
  - **真机部署：** 共享运动潜空间省去图像生成、关键点提取、平滑与重定向，执行帧率从 15 FPS 提升到
    60 FPS；用户研究中真实感、情感共鸣与唇形同步评分分别为 3.41 / 3.36 / 3.78（RIT 为
    2.98 / 2.73 / 3.40）。

  ## 视频

  <video src="/videos/humanoid-face-expression.mp4" poster="/videos/humanoid-face-expression.jpg" controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

  ## 演示片段

  同一网络在纯文本驱动（T2V）下生成的八段短表情，展示细粒度的眉、眼、唇部协同动态。

  <div class="demo-grid">
  <figure>
  <video src="/videos/humanoid-demo-blink-nervous.mp4" poster="/videos/humanoid-demo-blink-nervous.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>快速眨眼，显得略微紧张</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-smile-fade-serious.mp4" poster="/videos/humanoid-demo-smile-fade-serious.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>露出浅浅的微笑，随即迅速淡去转为略显严肃</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-squint-impatient.mp4" poster="/videos/humanoid-demo-squint-impatient.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>轻轻眯眼并望向别处，显得有点不耐烦</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-eyebrow-lips.mp4" poster="/videos/humanoid-demo-eyebrow-lips.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>轻轻挑起一边眉毛并微启双唇</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-soft-smile-playful-brow.mp4" poster="/videos/humanoid-demo-soft-smile-playful-brow.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>柔和地微笑并俏皮地扬起眉毛</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-head-tilt-doubtful.mp4" poster="/videos/humanoid-demo-head-tilt-doubtful.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>歪着头，露出一丝怀疑的神情</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-head-tilt-curious.mp4" poster="/videos/humanoid-demo-head-tilt-curious.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>微微歪头，同时好奇地扬起眉毛</figcaption>
  </figure>
  <figure>
  <video src="/videos/humanoid-demo-mouth-open-awe.mp4" poster="/videos/humanoid-demo-mouth-open-awe.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>微微张开嘴，神情透着轻柔的惊叹</figcaption>
  </figure>
  </div>

  ## 人脸到机器人表情重定向

  同一段人类表演，经运动潜在接口读出后重定向到机械脸执行器。

  <figure>
  <video src="/videos/humanoid-demo-retargeting-30s.mp4" poster="/videos/humanoid-demo-retargeting-30s.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
  <figcaption>人脸表演读出的运动潜在，重定向到机械脸执行器指令，逐帧驱动真实硬件。</figcaption>
  </figure>
---

## Overview

<figure>
<img src="/images/rose-overview.jpg" alt="ROSE overview" />
<figcaption><strong>Fig. 1: ROSE overview.</strong> Human, digital-human, and face-robot observations are mapped by ROSE-VAE into a shared facial-motion latent space. ROSE-Flow generates motion-latent trajectories from text and/or audio, and ROSE-Act maps them to the actuator actions of a real robot. The right side illustrates real-time interaction, human-to-robot retargeting, and text/audio to expression applications.</figcaption>
</figure>

## Robot platform

The platform accommodates 34 actuators for facial expression and neck motion, combining
tendon-sheath transmission with local rigid mechanisms. Actuators are concentrated near the top and
rear of the head, with tendons routed to the brows, eyelids, cheeks, and lips; local linkages,
pushrods, and shafts additionally drive the jaw, mouth corners, philtrum, and eyeballs, while the
neck supports pitch, roll, and yaw.

<figure>
<img src="/images/rose-hardware.jpg" alt="ROSE robot platform: tendon-sheath transmission and actuator layout" />
<figcaption><strong>Robot platform.</strong> (a) Full assembly; (b) eyebrow and cheek drive wires; (c) eye module with eye-pitch actuator and eyelid pushrod; (d) mouth module with jaw drive rod and upper/lower lip linkages; (e) neck module with yaw actuator and paired tilt actuators.</figcaption>
</figure>

## Method

- **ROSE-VAE: identity–motion factorization.** Identity and motion encoders extract an identity
  latent and per-frame motion coefficients; the coefficients are projected through a shared,
  orthogonality-regularized learnable motion basis and added to the identity latent before
  decoding. Human, digital-human, and robot observations share the same encoder, motion basis, and
  decoder, and a masked component perceptual loss keeps fine lip, eye, and brow motion from being
  washed out.
- **ROSE-Flow: text–audio conditional motion generation.** A dual-stream MMDiT performs flow
  matching in the motion latent space. Text specifies global intent and expression style, while
  Wav2Vec 2.0 audio features drive articulation through **frame-local audio window attention**.
  **Progressive modality unification** — audio-to-motion (A2M) pretraining, text-to-motion (T2M)
  adaptation initialized from it, weight merging, then joint training — yields one model for A2M,
  T2M, and TA2M.
- **ROSE-Act: latent-to-actuator mapping.** Synchronized robot image / actuator-state pairs are
  collected through safe motor babbling; ROSE-VAE extracts their motion coefficients to train the
  latent-to-actuator mapping. At inference, calibration, joint limits, and rate limits constrain the
  commands, with no intermediate image reconstruction.

<figure>
<img src="/images/rose-method.jpg" alt="ROSE-Flow architecture" />
<figcaption><strong>ROSE-Flow architecture.</strong> (a) Text–motion dual-stream MMDiT trained with the frozen ROSE-VAE encoder; generated motion latents are mapped to real-robot servo commands, and decoded faces are for visualization only. (b) Audio window attention: each motion-frame query attends only to audio tokens in its local window. (c) Progressive modality unification: A2M pretraining → T2M adaptation → weight merging → joint training.</figcaption>
</figure>

## Key results

- **Cross-identity motion representation:** on 24 cross-identity reenactment tasks, ROSE-VAE reaches
  a target-identity similarity (CSIM-T) of 0.741 vs. 0.730 for the FLOAT VAE, and a head-pose error
  (APD) of 1.26° vs. 1.35°.
- **Talking-face generation:** lowest FID and FVD on both HDTF and RAVDESS (FVD 54.6 / 56.8 vs.
  70.2 / 81.8 for the strongest baseline, FLOAT), and the lowest LSE-D on both (9.785 / 7.298).
- **Real-robot lip articulation:** lowest mouth-latent MSE on all three RAVDESS test utterances,
  e.g. 0.0158 vs. 0.0202 for RIT on Speech 1.
- **Real-robot deployment:** skipping image generation, landmark extraction, smoothing, and
  retargeting raises the execution frame rate from 15 FPS to 60 FPS; in a user study ROSE scores
  3.41 / 3.36 / 3.78 for realism, emotional resonance, and lip sync (RIT: 2.98 / 2.73 / 3.40).

## Video

<video src="/videos/humanoid-face-expression.mp4" poster="/videos/humanoid-face-expression.jpg" controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

## Demo clips

Eight short expressions generated by the same network from text alone (T2V), showing fine-grained
coordination of brows, eyes, and lips.

<div class="demo-grid">
<figure>
<video src="/videos/humanoid-demo-blink-nervous.mp4" poster="/videos/humanoid-demo-blink-nervous.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Blinks quickly, looking slightly nervous</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-smile-fade-serious.mp4" poster="/videos/humanoid-demo-smile-fade-serious.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>A faint smile that quickly fades into a more serious look</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-squint-impatient.mp4" poster="/videos/humanoid-demo-squint-impatient.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Narrows the eyes and looks away, seeming a little impatient</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-eyebrow-lips.mp4" poster="/videos/humanoid-demo-eyebrow-lips.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Raises one eyebrow and parts the lips slightly</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-soft-smile-playful-brow.mp4" poster="/videos/humanoid-demo-soft-smile-playful-brow.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>A soft smile with a playful eyebrow raise</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-head-tilt-doubtful.mp4" poster="/videos/humanoid-demo-head-tilt-doubtful.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Tilts the head, with a hint of doubt</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-head-tilt-curious.mp4" poster="/videos/humanoid-demo-head-tilt-curious.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Tilts the head slightly while raising the eyebrows in curiosity</figcaption>
</figure>
<figure>
<video src="/videos/humanoid-demo-mouth-open-awe.mp4" poster="/videos/humanoid-demo-mouth-open-awe.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Opens the mouth slightly, with a soft look of wonder</figcaption>
</figure>
</div>

## Face-to-robot retargeting

The same human performance, read out through the motion latent interface and retargeted onto the
face robot's actuators.

<figure>
<video src="/videos/humanoid-demo-retargeting-30s.mp4" poster="/videos/humanoid-demo-retargeting-30s.jpg" autoplay muted loop controls playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>
<figcaption>Motion read out from a human facial performance, retargeted to face-robot actuator commands and driving the real hardware frame by frame.</figcaption>
</figure>

