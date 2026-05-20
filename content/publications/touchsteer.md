---
title: "TouchSteer: Grounding Natural Language in Tactile Perception via Steering Vectors"
title_zh: "TouchSteer：基于 Steering Vectors 的触觉感知与自然语言接地框架"
authors:
  - "Guanqun Cao"
  - "Yongji Fu"
  - "Yi Zhou"
  - "Gaojie Jin"
  - "Zhenyu Lu"
  - "Shan Luo"
venue: "IEEE Transactions on Robot Learning (TRL) (submission)"
venue_zh: "IEEE Transactions on Robot Learning (TRL)（投稿中）"
year: 2025
date: 2025-11-01
pdf: "/pdfs/touchsteer.pdf"
thumbnail: "/videos/touchsteer.mp4"
status: "under-review"
featured: true
bibtex: |
  @article{cao2025touchsteer,
    title={TouchSteer: Grounding Natural Language in Tactile Perception via Steering Vectors},
    author={Cao, Guanqun and Fu, Yongji and Zhou, Yi and Jin, Gaojie and Lu, Zhenyu and Luo, Shan},
    journal={Submitted to IEEE Transactions on Robot Learning},
    year={2025}
  }
abstract_en: |
  Tactile sensing provides robots with direct information about physical properties through contact,
  yet most existing methods describe tactile data using predefined attribute labels with limited
  semantic flexibility. Aligning tactile signals with human language enables richer,
  concept-level representations.

  In this work, we propose a transformer-based **tactile–language framework** that structures the
  shared embedding space as a *manipulable concept space* using **steering vectors**. These vectors
  encode tactile properties as semantic directions, providing explicit semantic control under
  limited supervision. The framework supports two complementary tasks out of the same latent space:
  given a free-form natural language query describing desired tactile properties, the robot
  retrieves the most relevant material from its tactile experience; and after contacting a surface
  physically, the robot generates a natural language description of its tactile properties.

  Experimental results show that the framework effectively retrieves tactile representations from
  free-form natural language and generates meaningful tactile descriptions grounded in tactile
  perception, supporting more effective human–robot interaction.
abstract_zh: |
  触觉传感能通过接触直接获取物体的物理属性，然而大多数现有方法仅采用预定义属性标签来描述触觉数据，
  语义灵活性受限。将触觉信号与自然语言对齐，可以得到更丰富的、概念级别的表示。

  本文提出一种基于 Transformer 的**触觉—语言框架**，借助 **Steering Vectors** 将共享嵌入空间
  组织为**可操控的概念空间**：这些向量把触觉属性编码为语义方向，使模型在有限监督下仍能对语义实施
  显式控制。同一潜空间支持两个互补任务：给定描述期望触觉属性的自然语言查询时，机器人可在其触觉
  经验中检索最相关的材料；而当机器人实际接触物体表面后，可生成对该表面触觉属性的自然语言描述。

  实验结果表明，该框架能够从自由形式的自然语言中有效检索触觉表示，并生成具有感知依据的触觉描述，
  从而更好地支持人—机器人交互。
---

## Motivation

Most tactile-learning pipelines describe contact data with a short list of fixed attribute labels
("smooth", "rough", "sticky"). This is convenient for classification but loses the richness of how
people actually talk about touch. We want a shared space where free-form language and tactile
signals live together, and where the semantic axes are *manipulable* rather than implicit.

## Framework

A transformer-based tactile–language model built around **steering vectors** that encode tactile
properties as explicit semantic directions. The shared latent space supports two complementary
tasks out of the same backbone:

- **Language → tactile retrieval.** Given a natural-language description of a desired tactile
  property, retrieve the most relevant material from tactile experience.
- **Tactile → language description.** After physically contacting a surface, generate a
  natural-language description of what it felt like.

## Video

<video src="/videos/touchsteer.mp4" poster="/videos/touchsteer.jpg" autoplay muted loop playsinline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5-page" x5-video-player-fullscreen="false" preload="metadata"></video>

