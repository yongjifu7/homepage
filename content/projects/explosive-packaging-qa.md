---
title: "Real-time Packaging QA on a Hazardous-Explosive Production Line"
title_zh: "高危粉末炸药包装流水线的封装质量实时质检"
summary: "Industrial vision QA system for a live hazardous-powder-explosive packaging line. ≥ 99% accuracy over a 30-day production run on the customer's RTX 4060; operator-level alarms via a fixed-protocol online-monitoring API."
summary_zh: "部署在高危粉末炸药包装流水线上的工业视觉质检系统，在客户 RTX 4060 上连续 30 天生产环境运行，准确率 ≥ 99%；通过固定协议在线监测 API 向上位机下发告警。"
date: 2024-03-01
stack: ["Multi-scale Feat", "Boundary Loss", "Cython", "TensorRT", "Reparam"]
thumbnail: ""
featured: true
order: 1
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
