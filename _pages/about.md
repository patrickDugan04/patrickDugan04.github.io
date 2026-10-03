---
permalink: /
title: "About Me"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<figure class="mathfig mathfig--hero">
  <canvas data-mobius-flow aria-label="Animated flow of a one-parameter group of Möbius transformations"></canvas>
  <figcaption>Orbits of a one-parameter group of Möbius transformations z ↦ (az + b)/(cz + d) with two fixed points (filled: attracting, ring: repelling). Particles follow the Steiner circles as the flow moves between elliptic, hyperbolic, and loxodromic. Click or drag to move a fixed point; double-click to let them drift. <span class="mathfig__readout" data-mobius-readout></span></figcaption>
</figure>
<script src="/assets/js/mobius-flow.js" defer></script>

I'm Patrick Dugan, a student at the University of Pennsylvania in the submatriculation program: an M.S.E. and B.S.E. in Computer Science and a B.A. in Mathematics, expected December 2027. My work sits where math and CS meet: proving things about combinatorial objects, and building systems that use machine learning and compilers.

## Research

**Real roots of chain polynomials.** My preprint [*Root Bounds for Chain Polynomials Beyond the Cohen–Macaulay World*](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials) proves that every finite graded poset has all the real roots of its chain polynomial in [−4, 0], and that the constant 4 is sharp. The usual tools for bounds like this are topological (shellability, Cohen–Macaulayness, h-vectors), and graded posets need not satisfy them. The paper uses a sign condition on the inverse of I + aA instead, which can be checked one pair of vertices at a time. The same idea gives shorter intervals for subspace lattices and for Eulerian and k-Eulerian posets, and it even covers relations that aren't partial orders, such as chains of normal subgroups. Submitted to the *Electronic Journal of Combinatorics*. ([PDF](/files/Dugan_chain_polynomial_root_bounds.pdf) · [watch the theorem run live](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials#explorer))

## Current interests

- **Algebraic and enumerative combinatorics:** real-rootedness, Möbius functions, and the poset side of the paper above. The open case I keep returning to is the coprime graph on the integers.
- **Learning theory:** the PAC model, VC dimension, and sample complexity. I'm taking Theory of Machine Learning with Michael Kearns this fall.
- **Compilers for ML:** MLIR/LLVM tooling and LLM agents for hardware design ([Concurrent EDA, summer 2026](/portfolio/2026-fpga-agent/)), and [C2NN](/portfolio/2026-c2nn/), a compiler that turns C programs into neural networks.
- **Machine perception:** projective geometry, camera models, and multi-view geometry.

## Elsewhere

I TA CIS 1600 (discrete math) at Penn. Before that I was a machine learning engineer at Palm Cosmetics (computer vision) and a data science intern in CMU's REUSE program. The [blog](/year-archive/) has older writeups, mostly mathematical oddities from high school onward.

Full details are on my [CV](/cv/).
