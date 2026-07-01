---
title: "Continually Learning Interactive Robot"
title_zh: "可持续学习的交互机器人"
summary: "An embodied agent that keeps expanding its behavior repertoire through ongoing human–robot interaction — new skills, new object concepts, and new language grounding are acquired online rather than baked in at training time."
summary_zh: "在长期人—机器人交互中不断拓展能力的具身智能体：新技能、新物体概念、新语言—动作对齐都在线习得，而非一次性预训练写死。"
date: 2025-10-01
stack: ["HRI", "Continual Learning", "Multimodal", "Agent"]
thumbnail: "/videos/continual-hri.mp4"
featured: true
order: 0
body_zh: |
  ## 研究动机

  大多数已部署的机器人在预训练结束的那一刻就"冻结"了——技能、物体词表和语言接地一旦数据配比
  锁定，就不再演化。但一台真正有用的家用或实验室机器人，需要在数周乃至数月的使用过程中，不断
  学会新任务、认识新物体、适应新的指令方式。这个项目把**持续学习当作系统的第一等属性**，而不是
  训练阶段的一个小技巧。

  ## 系统做什么

  - **在线技能习得。** 新的操作和导航技能可以从少量演示或纯语言纠正中学到，并且能整合进已有能力，
    而不会灾难性地遗忘之前学会的技能。
  - **语言接地的在线更新。** 当用户提到一个新物体或新属性（"皱巴巴的那个""摸起来粗糙的那一面"）
    时，智能体会实时更新它的语言—感知对齐，而不必等待下一轮重新训练。
  - **自我迭代循环。** 智能体回放近期的成功和失败案例，把它们蒸馏成紧凑的更新目标，并在会话之间
    用它们来精化自己的策略和世界模型。

  ## 定位

  这个项目是我更大研究目标的实践落点：让机器人与智能体系统通过与物理世界的持续交互，做到**持续
  学习**与**迭代自我提升**。它与发表论文页面上的触觉—视觉世界模型、触觉—语言相关工作是直接相通的。
---

## Motivation

Most deployed robots freeze at the end of pretraining — their skills, object vocabulary, and
language grounding stop evolving once the data mix is locked. But a genuinely helpful household or
lab robot needs to keep picking up new tasks, new objects, and new ways of being instructed, over
weeks and months of use. This project treats **continual learning as a first-class property of the
system**, not a training trick.

## What the system does

- **Online skill acquisition.** New manipulation and navigation skills are learned from a small
  number of demonstrations or language-only corrections, and integrated without catastrophically
  forgetting earlier skills.
- **Grounded language updates.** When a user refers to a new object or property ("the wrinkled
  one", "the side that feels rough"), the agent updates its language–perception alignment on the
  fly, rather than waiting for a retraining cycle.
- **Self-iteration loop.** The agent replays recent successes and failures, distills them into
  compact update targets, and uses them to refine its own policy and world model between sessions.

## Where it fits

This project is the practical anchor of my broader research goal: robot and agent systems that
*continuously learn* and *iteratively self-improve* through interaction with the physical world.
It feeds directly into the visuo-tactile world-model and tactile–language work on the publications
page.
