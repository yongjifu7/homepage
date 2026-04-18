---
title: "Intelligent Tennis Action Scoring System"
title_zh: "智能网球动作评分系统"
summary: "A two-stage scoring pipeline (OpenPose + LightGBM cold-start, then end-to-end model) that grades user tennis videos and provides corrective feedback. Invention patent accepted; 2nd prize at the 11th CAAI Digital Media Competition."
summary_zh: "两阶段网球动作评分系统（OpenPose + LightGBM 冷启动，后续端到端模型），根据用户视频打分并给出修正建议；已受理发明专利一项；荣获第十一届中国人工智能学会数字媒体大赛国家二等奖。"
date: 2024-03-01
stack: ["OpenPose", "LightGBM", "Qwen2.5-VL", "Focal Loss"]
order: 2
---

## Problem

Amateur tennis players often repeat non-standard motions that lead to injury. Expert coaching is expensive and not scalable. We built a system that lets users upload a swing video and receive an action-quality score together with targeted corrective feedback.

## Approach

**Cold start (few labels, skewed distribution).** A pose-based baseline using OpenPose keypoints + LightGBM, trained with focal loss to handle severe class imbalance between "standard" and "non-standard" samples.

**End-to-end model.** After pilot data collection at Sichuan University of Light Chemical Industry, we trained an end-to-end model on the larger, better-balanced dataset.

**Actionable feedback.** Qwen2.5-VL was prompted with the skeleton trajectory and numeric sub-scores, producing concrete corrective advice rather than a single number — this is what users actually use.

## Outcome

- Invention patent accepted: *"A Machine-Learning Based Tennis Action Scoring Method and System."*
- Second Prize (National), 11th CAAI Digital Media Competition.
