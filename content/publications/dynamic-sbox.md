---
title: "Constructing Dynamic S-boxes Based on Chaos and Irreducible Polynomials for Image Encryption"
title_zh: "基于混沌与不可约多项式的动态 S 盒构造及其在图像加密中的应用"
authors:
  - "Chunlei Luo"
  - "Yong Wang"
  - "Yongji Fu"
  - "et al."
venue: "Nonlinear Dynamics（Springer，JCR Q1，IF 6.0）"
venue_zh: "Nonlinear Dynamics（Springer，JCR Q1，IF 6.0）"
year: 2024
webpage: "https://link.springer.com/article/10.1007/s11071-024-09353-w"
status: "published"
bibtex: |
  @article{luo2024dynamic,
    title={Constructing Dynamic S-boxes Based on Chaos and Irreducible Polynomials for Image Encryption},
    author={Luo, Chunlei and Wang, Yong and Fu, Yongji and others},
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
---
