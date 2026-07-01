---
title: "Legal-Domain LLM Assistant"
title_zh: "基于大语言模型的法律助手"
summary: "A legal-service LLM built with Southwest University of Political Science and Law (SWUPL) and Beijing Chaoxing Tianxia: RoPE-extended long-context backbone, legal knowledge graph + vector DB, tool-calling and form-filling agent, and a small intent/NER model that rewrites user questions into formal logical symbols for reasoning."
summary_zh: "与西南政法大学及北京朝行天下科技有限公司合作开发的法律服务大模型：扩展 RoPE 以处理长篇法律文书、构建法律知识图谱与向量数据库、工具调用与表单填写 Agent、并使用轻量意图识别 + 命名实体识别模型将用户问题转写为可推理的形式化逻辑符号。"
date: 2023-08-01
stack: ["LLM", "RoPE", "Knowledge Graph", "RAG", "Agent", "NER"]
thumbnail: ""
featured: true
order: 2
body_zh: |
  ## 背景

  与**西南政法大学**及**北京朝行天下科技有限公司**合作的项目，目标是构建一个能读长篇法规/合同、
  引用有据可查、并能走完多步法律推理的生产级法律助手。

  ## 贡献

  - **面向长篇法律文书的 RoPE 扩展。** 修改预训练模型的 RoPE 位置编码，使骨干网络在很长的输入上
    仍保持连贯——这对端到端阅读法规、判决书和合同、而不必临时切块，是必要的。
  - **扎根于法律的检索栈。** 构建了**法律知识图谱** + **向量数据库**，配合一个**工具调用/表单
    填写 Agent**。该 Agent 自主决定何时查询知识图谱、何时执行一次 RAG 检索、何时向用户询问缺失
    的表单字段，显著降低了在事实敏感问题上的幻觉。
  - **逻辑符号改写模块。** 训练了一个轻量的**意图识别 + 命名实体识别**模型，把自由形式的法律问题
    改写成形式化的逻辑符号表示（当事人、行为、条件、义务）。主 LLM 随后在这个符号化形式上做规划
    和推理，而不是直接面对原始文本，从而提升多步法律推理的可靠性。
  - **两阶段 K-means 数据流水线。** 为训练语料设计了一套可扩展的清洗与分类平台：**两阶段
    K-means** 先分离出明显的重复项/低质量片段，再按法律主题对剩余内容聚类，同时喂给自动化和
    人工在环的标注流程。这正是产出高质量领域监督数据、支撑模型微调的关键环节。

  ## 设计取舍

  这个项目把 LLM 当作法律推理系统里的一个组件，而不是一个单体式的"万能回答者"。知识图谱 + 符号化
  改写 + Agent 循环才是**正确性**的主要来源；LLM 的工作是流畅地执行这个计划，而不是凭空编造它。
---

## Context

A joint project with **Southwest University of Political Science and Law (SWUPL)** and
**Beijing Chaoxing Tianxia Technology Co., Ltd.**, aimed at building a production-grade legal
assistant that can read long statutes / contracts, keep citations grounded, and walk through
multi-step legal reasoning.

## Contributions

- **RoPE extension for long legal documents.** Modified the pretrained RoPE positional
  embeddings so the backbone stays coherent on very long inputs — necessary for end-to-end
  reading of statutes, judgments and contracts without ad-hoc chunking.
- **Retrieval stack grounded in law.** Built a **legal knowledge graph** + **vector database**
  paired with a **tool-calling / form-filling agent**. The agent decides when to query the KG,
  when to run a RAG pass, and when to ask the user for a missing form field, which
  substantially reduces hallucination on fact-sensitive questions.
- **Logic-symbolic rewriting module.** Trained a small **intent-recognition + named-entity
  recognition** model that rewrites free-form legal questions into a formal logical-symbol
  representation (parties, acts, conditions, obligations). The main LLM then plans and reasons
  over this symbolic form rather than raw text, improving multi-step legal reasoning.
- **Two-stage K-means data pipeline.** Designed a scalable cleaning-and-classification platform
  for the training corpus: a **two-stage K-means** first separates obvious duplicates /
  low-quality spans, then clusters remaining content by legal topic, feeding both automated and
  human-in-the-loop labelling workflows. This is what produced the high-quality domain
  supervised data the model was fine-tuned on.

## Design notes

The project treats the LLM as one component inside a legal-reasoning system rather than a
monolithic answerer. The KG + symbolic rewrite + agent loop is where most of the *correctness*
comes from; the LLM's job is to follow the plan fluently, not to invent it.
