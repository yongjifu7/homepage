---
title: "Real-time Packaging QA on a Hazardous-Explosive Production Line"
title_zh: "高危粉末炸药包装流水线的封装质量实时质检"
summary: "Industrial vision QA system for a live hazardous-powder-explosive packaging line. ≥ 99% accuracy over a 30-day production run on the customer's RTX 4060; operator-level alarms via a fixed-protocol online-monitoring API."
summary_zh: "部署在高危粉末炸药包装流水线上的工业视觉质检系统，在客户 RTX 4060 上连续 30 天生产环境运行，准确率 ≥ 99%；通过固定协议在线监测 API 向上位机下发告警。"
date: 2024-03-01
stack: ["Multi-scale Feat", "Boundary Loss", "Cython", "TensorRT", "Reparam"]
thumbnail: "/videos/explosive-packaging-qa.mp4"
featured: true
order: 1
body_zh: |
  ## 问题

  客户的产线负责封装高危粉末炸药，任何封装质量缺陷都必须在产线节拍时间内被识别出来，赶在下一个
  工件进入危险区域之前。这条产线有四个棘手条件：(i) 光照差且不断变化；(ii) 封装线材在画面中目标
  很小；(iii) 封边边缘经常运动模糊；(iv) 传送带有不规律抖动，破坏了朴素的时序假设。用干净公开
  数据训练出来的常规检测器，在这里根本活不下来。

  ## 方法

  - **鲁棒检测器。** 多尺度特征提取器 + 聚焦边界的损失函数，让模型咬住封边边缘而不是整体轮廓；
    多帧融合抵消抖动；逐帧直方图归一化中和光照漂移。四者叠加，把准确率从"不可用"提升到留出在线
    测试集上的 **≥ 99%**。
  - **热路径上的规则闸门。** 一层基于 Cython 实现的带缓冲规则层跑在网络前面，先筛掉明显没问题的
    帧，让昂贵的模型只处理模糊样本。网络本身是**检测—分割双任务**模型，骨干网络使用**结构重
    参数化**，使得部署时的计算图只是一叠简单的卷积层，尽管训练时用的是多分支模块。
  - **部署。** 通过 **TensorRT** 导出到客户现场的 GPU。在 RTX 4060 上推理吞吐从 **4 FPS 提升到
    15 FPS（约 3.75 倍）**，稳稳落在节拍时间之内。
  - **系统集成。** 设计并交付了一套固定协议的在线监测 API，让既有的 PLC / SCADA 系统无需改动即可
    接收告警。整条流水线在生产环境里连续运行 **30 天**，准确率持续保持在 ≥ 99%。

  ## 为什么重要

  这不是一个刷榜数字——这是一套实际部署在炸药处理环境里的缺陷检测器，一次漏检就有真实后果。这个
  项目的工程取向（在硬件边缘保证鲁棒性、严格的延迟预算、与既有自动化系统之间的互信接口）更接近
  "把机器学习真正交付上线"，而不是"把它发表出来"。
---

## Problem

The client's production line packages hazardous powder explosives; any sealing-quality defect
must be caught within the line's cycle time, before the next piece enters the dangerous zone.
The line has four nasty conditions: (i) poor and changing illumination, (ii) the sealing seam is
small in frame, (iii) the seam edge is frequently motion-blurred, and (iv) the conveyor has
irregular vibration that breaks naive temporal assumptions. Standard detectors trained on clean
public data simply do not survive here.

## Approach

- **Robust detector.** Multi-scale feature extractor + boundary-focused loss, so the model locks
  onto the seam edge instead of bulk shape; multi-frame fusion to average out the vibration; and
  per-frame histogram normalisation to neutralise lighting drift. These four together push
  accuracy from "unusable" to **≥ 99%** on a held-out on-line test set.
- **Rule gate in hot path.** A buffered Cython-based rule layer runs in front of the network to
  reject trivially-good frames, so the expensive model only looks at ambiguous cases. The
  network itself is a **detection–segmentation dual-task** model, and the backbone uses
  **structural reparameterisation** so the deployment graph is a simple stack of conv layers
  even though training uses multi-branch blocks.
- **Deployment.** Exported via **TensorRT** to the customer's on-site GPU. Inference throughput
  went from **4 FPS → 15 FPS (≈ 3.75×)** on an RTX 4060, comfortably inside cycle time.
- **System.** Designed and shipped a fixed-protocol online-monitoring API so the existing PLC /
  SCADA stack can ingest alarms without changes. The pipeline ran continuously for **30 days**
  in production with sustained ≥ 99 % accuracy.

## Why it matters

This is not a benchmark leaderboard number — it is a defect detector deployed in an actual
explosives-handling environment, where a false negative has real-world consequences. The
engineering bias of the project (robustness at the hardware edge, strict latency budget,
mutual-trust interface with legacy automation) is closer to shipping production ML than to
publishing it.
