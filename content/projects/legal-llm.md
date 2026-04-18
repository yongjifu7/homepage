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
