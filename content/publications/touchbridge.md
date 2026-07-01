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
  传感器各自通过一个可逆的“桥”连接到规范空间，并对这些桥进行联合训练，使规范空间保持与传感器
  无关，同时又能解码回各自的原生传感器域。这样，在某一传感器上训练的操作策略或表示就能在另一个
  传感器上运行，几乎不需要新的触觉数据。

  我们在跨传感器操作任务上进行评估，将触觉表示与基于接触的控制在不同传感器间迁移，结果表明可逆
  的规范空间既保留了下游操作所需的接触信息，又实现了传感器到传感器的转换。
---

## Motivation

Optical tactile sensors — GelSight, DIGIT, TacTip, and their variants — see contact through very
different geometry, lighting, and gel optics. A representation learned on one of them is tied to
that sensor's appearance, so policies and tactile encoders do not transfer: every new fingertip
means re-collecting data and re-training. We want a single space that is **sensor-agnostic** yet
**reversible**, so that what one sensor feels can be expressed for any other.

## Approach

- **Reversible canonical tactile space.** A shared latent into which each sensor is encoded and, by
  construction, can be decoded back — turning cross-sensor transfer into translation rather than a
  one-way embedding.
- **Multi-bridge alignment.** Each sensor connects to the canonical space through its own invertible
  bridge; the bridges are trained jointly so the canonical space stays sensor-agnostic while
  remaining decodable to every native sensor domain.
- **Downstream use.** Tactile representations and contact-driven manipulation policies trained on
  one sensor are deployed on another with little or no new tactile data.

## Figures

![Paired data collection via quasi-static force equilibrium. (i) Data collection setup; (ii) coordinate alignment by mirroring; (iii–iv) canonicalizing heterogeneous raw signals.](/images/touchbridge-fig3-data-collection.png)

![Plugging UniForce into a Vision-Language-Action model. Heterogeneous tactile inputs are unified as force-grounded tokens via UniForce for force-aware robot manipulation, i.e., whiteboard wiping.](/images/touchbridge-fig7-vla.png)
