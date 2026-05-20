---
title: "Learning Realistic Expressions for Humanoid Face Robots"
title_zh: "仿人面部机器人逼真表情学习"
authors:
  - "Yongji Fu"
  - "et al."
venue: "In preparation; target: ICRA 2026"
venue_zh: "撰写中；目标：ICRA 2026"
year: 2025
date: 2025-09-15
thumbnail: "/videos/humanoid-face-expression.mp4"
status: "in-preparation"
featured: true
bibtex: |
  @unpublished{fu2025humanoidface,
    title={Learning Realistic Expressions for Humanoid Face Robots},
    author={Fu, Yongji and others},
    note={Manuscript in preparation; target venue: IEEE International Conference on Robotics and Automation (ICRA) 2026},
    year={2025}
  }
abstract_en: |
  Humanoid face robots need expressions that look natural to a human observer while remaining
  physically executable on a motor-driven face with bounded actuation. This work learns a mapping
  from target facial signals to the robot's low-level actuator commands that reproduces human-like
  micro-dynamics — not just static key poses — and stays stable under the hardware's mechanical
  limits. The pipeline covers data collection, retargeting, and a learned controller that
  balances visual fidelity against physical feasibility.
abstract_zh: |
  仿人面部机器人的表情需要在"对观察者而言看起来自然"与"在有限驱动能力的机械面部上可执行"
  之间达到平衡。本文学习一种从目标面部信号到机器人底层执行器指令的映射，不只复现静态关键
  表情，还复现了类人化的微动态，同时保持机械极限内的稳定。工作包括数据采集、重定向，以及
  一个在视觉逼真度与物理可行性之间做折衷的学习控制器。
---

## Motivation

Humanoid face platforms fail in two directions: either the motion looks mechanical (physically
valid but visually dead) or the learned controller drives the hardware outside its safe operating
envelope chasing visual realism. We want expressions that *look* human and *run* on real motors.

## Approach

- **Retargeting from human reference.** Target facial signals are mapped into the robot's
  actuator space with explicit constraints for torque, range, and coupling between adjacent
  degrees of freedom.
- **Learned controller.** A controller predicts actuator trajectories that reproduce both the
  key pose and the micro-dynamics of a target expression, trained with objectives that jointly
  score perceptual fidelity and physical feasibility.
- **Closed-loop evaluation.** The model is deployed on the physical face hardware and evaluated
  on both objective motion metrics and subjective human judgment.

## Video

<video src="/videos/humanoid-face-expression.mp4" poster="/videos/humanoid-face-expression.jpg" autoplay muted loop playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

