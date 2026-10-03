---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

Education
======
* **University of Pennsylvania**, Philadelphia, PA, expected December 2027
  * M.S.E. in Computer Science (submatriculation), B.S.E. in Computer Science, B.A. in Mathematics
  * GPA 4.0/4.0
  * Current coursework: Theory of Machine Learning (Michael Kearns), Machine Perception

Research
======
* **Real root bounds for chain and walk-generating polynomials** (independent research, 2025–2026)
  * Proved that a sign-alternation condition on (I + aA)⁻¹ for a weighted DAG confines all real roots of its walk-generating polynomials to [−a, 0].
  * Consequences: a sharp [−4, 0] for the chain polynomial of every finite graded poset, [−4/(q+1), 0] for subspace lattices, and [−1/k, 0] for k-Eulerian posets. The proofs are elementary and avoid homological methods.
  * Preprint submitted to the *Electronic Journal of Combinatorics* ([PDF](/files/Dugan_chain_polynomial_root_bounds.pdf)).

Experience
======
* **Compiler / AI Engineering Intern**, Concurrent EDA, Pittsburgh, PA (May–Aug 2026)
  * Built an LLM-driven agent for end-to-end FPGA development (HDL generation → synthesis → optimization) on MLIR/LLVM with a custom MCP tool server.
  * Wrote automated optimization passes, design-analysis heuristics, and code-rewrite tools for the agent.
  * Compared with an unassisted LLM baseline: 16× fewer tokens, 30–40% faster design iteration, and synthesizable HDL up from 80% to 100%.
* **Machine Learning Engineer**, Palm Cosmetics, remote (2025–2026)
  * Built a computer-vision pipeline that measures nail shape and size from customer video and classifies nail type for product sizing. It holds up under real-world lighting, camera angles, and hand positions.
* **Data Science Intern**, Carnegie Mellon University REUSE, Pittsburgh, PA (May–Aug 2025)
  * Built data pipelines over large volumes of GitHub event data and NLP models to detect shifts in developer behavior in the Rust ecosystem, for faculty research on open-source collaboration.

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
* **ML:** PyTorch, TensorFlow, scikit-learn, Hugging Face, NumPy, pandas; LLM agents, MCP, retrieval, computer vision
* **Systems:** LLVM, MLIR, FPGA/HDL toolchains, Docker, Spark, AWS, PostgreSQL, Git, Linux
* **Mathematics:** combinatorics, abstract algebra, spectral graph theory, learning theory (PAC, VC dimension), projective geometry, measure theory, functional analysis
* **Spoken:** English (native), Japanese (elementary)

Service and leadership
======
* Member, Penn Stwing
