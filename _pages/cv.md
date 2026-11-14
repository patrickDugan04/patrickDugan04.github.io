---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

**[Download my one-page resume (PDF)](/files/Patrick_Dugan_Resume.pdf)**

Education
======
* **University of Pennsylvania**, Philadelphia, PA, expected December 2027
  * M.S.E. in Computer Science (submatriculation), B.S.E. in Computer Science, B.A. in Mathematics
  * GPA 3.99/4.0
  * Current coursework: Theory of Machine Learning (Michael Kearns), Machine Perception

Research
======
* **Real root bounds for chain and walk-generating polynomials** (independent research, 2025–2026)
  * Proved that a sign-alternation condition on (I + aA)⁻¹ for a weighted DAG confines all real roots of its walk-generating polynomials to [−a, 0].
  * Consequences: a sharp [−4, 0] for the chain polynomial of every finite graded poset, [−4/(q+1), 0] for subspace lattices, and [−1/k, 0] for k-Eulerian posets. The proofs are elementary and avoid homological methods.
  * Preprint, 2026 ([PDF](/files/Dugan_chain_polynomial_root_bounds.pdf)).

Experience
======
* **AI Engineering Intern (LLM Agents)**, Concurrent EDA, Pittsburgh, PA (May–Aug 2026)
  * Pitched and built solo an LLM agent that automates FPGA design from C code to optimized HDL, using custom agent skills, tool scripts, and MLIR/LLVM program analysis. The prototype was chosen for production.
  * Built a 100+ task evaluation benchmark and A/B tested prompts, tools, and code transforms; caught a train/test leakage bug and added a system that prunes unreliable transforms over time.
  * Compared with an unassisted LLM baseline: 16× fewer tokens, 30–40% faster design iteration, and synthesizable HDL up from 80% to 100%.
* **Machine Learning Engineer**, Palm Cosmetics, remote (Dec 2025 – Jan 2026)
  * Built a computer-vision pipeline that sizes nails from customer hand images. With only about 100 labeled samples, I chose graph-based feature extraction with linear and Gaussian mixture models over deep learning.
* **Data Science Research Intern**, Carnegie Mellon University REUSE, Pittsburgh, PA (May–Aug 2025)
  * Built an LLM (Gemini) scoring pipeline over GitHub pull requests and comments to measure how Rust's yearly roadmaps steer open-source work, replacing keyword matching. Found effects the original study missed.

Publications
======
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

Teaching
======
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

Projects
======
  <ul>{% for post in site.portfolio reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

Skills
======
* **Languages:** Python, C, C++, Java, Haskell, OCaml, SQL, JavaScript/TypeScript, Bash
* **AI/ML:** LLMs, transformers, LLM agents, prompt engineering, RAG, evals, A/B testing, fine-tuning, RL, NLP, computer vision, deep learning, neurosymbolic AI
* **Frameworks:** PyTorch, TensorFlow, Hugging Face, scikit-learn, NumPy, pandas
* **Systems:** LLVM, MLIR, FPGA/HDL toolchains, Docker, Spark, AWS, PostgreSQL, Git, Linux
* **Mathematics:** combinatorics, abstract algebra, spectral graph theory, learning theory (PAC, VC dimension), projective geometry, measure theory, functional analysis
* **Spoken:** English (native), Japanese (elementary)

Service and leadership
======
* Member, Penn Stwing
