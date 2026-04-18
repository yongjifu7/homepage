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
