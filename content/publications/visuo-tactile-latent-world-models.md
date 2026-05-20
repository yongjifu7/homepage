---
title: "Visuo-Tactile Latent World Models"
title_zh: "视觉—触觉联合的潜空间世界模型"
authors:
  - "Yongji Fu"
  - "et al."
venue: "In preparation; target: ICRA 2026"
venue_zh: "撰写中；目标：ICRA 2026"
year: 2025
date: 2025-09-15
thumbnail: "/videos/visuo-tactile-latent-world-models.mp4"
status: "in-preparation"
featured: true
bibtex: |
  @unpublished{fu2025visuotactile,
    title={Visuo-Tactile Latent World Models},
    author={Fu, Yongji and others},
    note={Manuscript in preparation; target venue: IEEE International Conference on Robotics and Automation (ICRA) 2026},
    year={2025}
  }
abstract_en: |
  Contact-rich manipulation needs a world model that predicts not only what the scene will look
  like after an action but also what it will feel like at the fingertips. This work trains a
  **visuo-tactile latent world model** that jointly encodes vision and tactile signals into a
  shared latent space and rolls out future states in that space. The model supports planning and
  policy learning for tasks where contact events — slip, stick, sudden force changes — carry
  information that pure vision cannot see.
  
  We evaluate on manipulation tasks that are ambiguous under vision alone, and show that adding
  the tactile channel to the latent dynamics improves both predictive accuracy and downstream
  task success.
abstract_zh: |
  需要丰富接触的操作任务，要求世界模型不仅能预测动作之后场景看起来是什么样，还要预测指尖
  感受到什么。本文训练一个**视觉—触觉联合的潜空间世界模型**，将视觉与触觉信号联合编码到
  共享潜空间，并在该空间中推演未来状态。该模型可用于规划与策略学习，适合打滑、粘连、力突变
  等视觉看不到但触觉能捕捉到的任务。

  我们在仅凭视觉存在歧义的操作任务上进行评估，结果显示在潜空间动力学中引入触觉通道可同时
  改善状态预测精度与下游任务成功率。
---

## Motivation

Vision-only world models struggle on contact-rich manipulation because the information that
decides success — is the object about to slip, is the grasp stable, did the tool just engage —
lives in the force/tactile signal, not in pixels. We want a world model whose latent captures
both modalities so that planning and policy learning can reason about contact.

## Approach

- **Shared visuo-tactile latent.** A joint encoder fuses vision and tactile readings into one
  latent state, aligned so that either modality alone still maps into the same space.
- **Latent-space rollout.** Dynamics are learned and unrolled entirely in the latent, enabling
  cheap multi-step prediction for planning.
- **Downstream use.** The learned latent + dynamics are used for model-predictive control and as
  a representation for policy learning on contact-rich manipulation tasks.

## Video

<video src="/videos/visuo-tactile-latent-world-models.mp4" poster="/videos/visuo-tactile-latent-world-models.jpg" autoplay muted loop playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

