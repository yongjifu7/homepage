---
title: "Constructing Dynamic S-boxes Based on Chaos and Irreducible Polynomials for Image Encryption"
title_zh: "基于混沌与不可约多项式的动态 S 盒构造及其在图像加密中的应用"
authors:
  - "Chenhong Luo"
  - "Yong Wang"
  - "Yongji Fu"
  - "et al."
venue: "Nonlinear Dynamics（Springer，JCR Q1，IF 6.0）"
venue_zh: "Nonlinear Dynamics（Springer，JCR Q1，IF 6.0）"
year: 2024
webpage: "https://link.springer.com/article/10.1007/s11071-024-09353-w"
thumbnail: "/images/sbox.png"
status: "published"
bibtex: |
  @article{luo2024dynamic,
    title={Constructing Dynamic S-boxes Based on Chaos and Irreducible Polynomials for Image Encryption},
    author={Luo, Chenhong and Wang, Yong and Fu, Yongji and others},
    journal={Nonlinear Dynamics},
    year={2024},
    publisher={Springer}
  }
abstract_en: |
  Substitution boxes (S-boxes) lie at the heart of modern symmetric ciphers, and the cryptographic
  strength of a cipher depends heavily on the nonlinearity, differential uniformity, and
  unpredictability of its S-box. Static S-boxes, however, are vulnerable to algebraic and
  side-channel attacks once their structure is fixed. This work proposes a **dynamic S-box
  construction** scheme that combines a two-dimensional chaotic map with irreducible polynomials
  over the finite field $\mathrm{GF}(2^8)$.

  The chaotic map provides key-dependent sensitivity and a vast parameter space, so that each key
  induces a distinct S-box; irreducible polynomials over $\mathrm{GF}(2^8)$ supply algebraic
  structure that bounds worst-case cryptographic metrics. We conduct ablation experiments to
  evaluate the generated S-boxes on the standard battery of cryptographic criteria — nonlinearity,
  strict avalanche criterion (SAC), bit independence criterion (BIC), and differential / linear
  approximation probabilities — and on generation efficiency. The constructed S-boxes consistently
  meet or exceed the requirements for cryptographic use.

  We further integrate the dynamic S-box into a block-cipher image encryption pipeline, and show
  on standard test images that it delivers strong pixel-level confusion and diffusion, near-uniform
  ciphertext histograms, high NPCR/UACI scores against plaintext-sensitivity attacks, and robust
  resistance to differential, statistical, and brute-force attacks.
abstract_zh: |
  S 盒（替换盒）是现代对称密码体制的核心组件，其非线性度、差分均匀性和不可预测性直接决定了密码算法的安全性。然而，
  静态 S 盒一旦结构固定，就容易受到代数攻击与侧信道攻击。本文提出了一种**动态 S 盒构造**方案，结合二维混沌映射与
  $\mathrm{GF}(2^8)$ 上的不可约多项式：混沌映射提供密钥敏感性与巨大参数空间，使不同密钥生成不同 S 盒；不可约多项式
  则提供代数结构以约束最坏情况下的密码学指标。

  消融实验在非线性度、严格雪崩准则（SAC）、比特独立准则（BIC）、差分/线性逼近概率以及生成效率等标准密码学指标上系统
  评估所生成的 S 盒，结果均满足或优于密码学使用要求。

  我们进一步将动态 S 盒集成到分组密码图像加密流程中，在标准测试图像上验证其加密效果：像素级扰乱与扩散效果显著，密文
  直方图接近均匀分布，NPCR / UACI 分数高，能有效抵抗差分攻击、统计攻击与暴力破解。
body_zh: |
  ## 研究背景

  对称密码依赖 S 盒提供混淆层，用以抵抗线性与差分密码分析。一个结构固定、不随密钥变化的静态 S 盒，
  会在其产生的每一份密文中泄漏同样的代数结构——一旦这个结构被摸清，就成了天然的攻击面。

  ## 本文提出

  - **混沌驱动的密钥相关生成。** 用一个二维混沌映射，为每个密钥生成一个全新的 S 盒；对初始条件的
    敏感性意味着密钥的微小变化就会带来结构完全不同的 S 盒。
  - **GF(2^8) 上的代数锚定。** 候选 S 盒由 GF(2^8) 上的不可约多项式构造，从而约束最坏情况下的
    非线性度与差分均匀性，使每一个实例都满足密码学要求。
  - **标准指标体系评估。** 在非线性度、严格雪崩准则（SAC）、比特独立准则（BIC）、差分/线性逼近
    概率上做消融，并测量生成效率。
  - **图像加密流程。** 将动态 S 盒接入分组密码图像加密器，在标准测试图像上评估：密文直方图接近
    均匀分布、NPCR/UACI 分数高，并能抵抗差分、统计与暴力破解攻击。

  ## 图示

  ![动态 S 盒构造](/images/sbox.png)
---

## Background

Symmetric ciphers rely on S-boxes to provide the confusion layer that resists linear and
differential cryptanalysis. A static, key-independent S-box leaks the same algebraic structure
across every ciphertext it produces, so once the structure is known it becomes the natural
attack surface.

## What this paper proposes

- **Chaos-driven keying.** A 2-D chaotic map is used to produce, for every key, a fresh S-box.
  Sensitivity to initial conditions means a small change in the key yields a structurally
  different S-box.
- **Algebraic anchoring in $\mathrm{GF}(2^8)$.** Candidate S-boxes are built from irreducible
  polynomials over $\mathrm{GF}(2^8)$, which bounds the worst-case nonlinearity and differential
  uniformity so that every instance meets the cryptographic criteria.
- **Standard-battery evaluation.** Ablations on nonlinearity, SAC, BIC, and
  differential/linear approximation probability, plus generation-cost measurements.
- **Image-encryption pipeline.** The dynamic S-box is dropped into a block-cipher image encryptor
  and evaluated on standard test images: near-uniform histograms, high NPCR/UACI, and resistance
  to differential / statistical / brute-force attacks.

## Figure

![Dynamic S-box construction](/images/sbox.png)

