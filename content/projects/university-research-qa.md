---
title: "University Research-Management QA System"
title_zh: "高校科研管理问答系统"
summary: "A fine-tuned Llama-3 assistant for university research administration, backed by a knowledge-graph vector store and a form-filling + RAG agent. Inference optimised from 31 → 177 tokens/sec via CUDA operator tuning and INT8 group-quantisation."
summary_zh: "面向高校科研管理场景的 Llama-3 微调问答助手；结合知识图谱向量数据库与表单填表规则 Agent + RAG 降低幻觉；CUDA 算子调优 + INT8 分组量化将推理速度从 31 tok/s 提升至 177 tok/s。"
date: 2024-01-15
stack: ["Llama-3", "CUDA", "TensorRT", "RAG", "Knowledge Graph"]
order: 3
---

## System

- **Data.** 5,000 high-quality QA pairs collected via web crawling, ChatGPT generation and manual curation; used to SFT Llama-3.
- **Retrieval layer.** Knowledge-graph backed vector DB paired with a form-filling rule agent and RAG, specifically chosen to reduce hallucination on factual administrative queries (regulations, deadlines, reimbursement policy, etc.).
- **Deployment.** Patent accepted: *"A Research-Management QA System Combining a Knowledge Graph with a Large Language Model."* System piloted inside the lab to support research-decision workflows.

## Inference optimisation

| Optimisation | Effect |
|---|---|
| CUDA operator tuning (RMSNorm, MatMul, KV-Cache, FlashAttention) | Bottleneck analysis via Night-Compute / Night-System |
| INT8 group quantisation + dynamic dequantisation kernel | Model 13.2 GB → 9.1 GB (≈ 30% smaller), accuracy drop < 3% |
| End-to-end throughput on RTX 4090 | **31 tok/s → 177 tok/s** (≈ 5.7×) |

## Example CUDA snippet (RMSNorm forward, simplified)

```cpp
__global__ void rms_norm_fwd(
    const half* __restrict__ x,
    const half* __restrict__ w,
    half* __restrict__ y,
    int hidden,
    float eps
) {
    int tid = threadIdx.x;
    int row = blockIdx.x;
    const half* xp = x + row * hidden;
    half* yp = y + row * hidden;

    float acc = 0.f;
    for (int i = tid; i < hidden; i += blockDim.x) {
        float v = __half2float(xp[i]);
        acc += v * v;
    }
    acc = blockReduceSum(acc);
    __shared__ float rms;
    if (tid == 0) rms = rsqrtf(acc / hidden + eps);
    __syncthreads();

    for (int i = tid; i < hidden; i += blockDim.x) {
        float v = __half2float(xp[i]) * rms * __half2float(w[i]);
        yp[i] = __float2half(v);
    }
}
```
