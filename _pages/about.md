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
<script src="/assets/js/mathsound.js" defer></script>
<script src="/assets/js/mobius-flow.js" defer></script>

I'm Patrick Dugan, a student at the University of Pennsylvania in the submatriculation program: an M.S.E. and B.S.E. in Computer Science and a B.A. in Mathematics, expected December 2027. I work on AI, usually with a proof and a prototype going at the same time. This summer at Concurrent EDA I built an LLM agent that designs FPGA hardware from C code, along with the benchmark used to evaluate it, and the prototype was chosen for production. On my own I'm building neural networks that compile down to logic circuits, so what they learn can be checked exactly. ([Resume, PDF](/files/Patrick_Dugan_Resume.pdf))

## Research

**Real roots of chain polynomials.** My preprint [*Root Bounds for Chain Polynomials Beyond the Cohen–Macaulay World*](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials) proves that every finite graded poset has all the real roots of its chain polynomial in [−4, 0], and that the constant 4 is sharp. The usual tools for bounds like this are topological (shellability, Cohen–Macaulayness, h-vectors), and graded posets need not satisfy them. The paper uses a sign condition on the inverse of I + aA instead, which can be checked one pair of vertices at a time. The same idea gives shorter intervals for subspace lattices and for Eulerian and k-Eulerian posets, and it even covers relations that aren't partial orders, such as chains of normal subgroups. Preprint, 2026. ([PDF](/files/Dugan_chain_polynomial_root_bounds.pdf) · [watch the theorem run live](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials#explorer))

## Playground

Small interactive pieces from my research and writing. Hover to preview; click through to play with the full version.

<div class="mathtiles">
  <a class="mathtile" href="/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials#explorer"><canvas data-thumb="chainRoots" aria-hidden="true"></canvas><span class="mathtile__title">Roots, live</span><span class="mathtile__hook">Random graded posets, every root inside [−4, 0].</span></a>
  <a class="mathtile" href="/posts/2022/08/Complex-Image-Mapping/"><canvas data-thumb="complexMap" aria-hidden="true"></canvas><span class="mathtile__title">Warp the plane</span><span class="mathtile__hook">Type any f(z) and watch the grid bend.</span></a>
  <a class="mathtile" href="/posts/2022/02/Fields/"><canvas data-thumb="cyclicClock" aria-hidden="true"></canvas><span class="mathtile__title">Cyclic clocks</span><span class="mathtile__hook">Powers of g mod p, and why (Z/pZ)<sup>×</sup> is cyclic.</span></a>
  <a class="mathtile" href="/posts/2022/08/Convolutions/"><canvas data-thumb="divisorMobius" aria-hidden="true"></canvas><span class="mathtile__title">Möbius on divisors</span><span class="mathtile__hook">The divisor lattice, coloured by μ.</span></a>
</div>
<script src="/assets/js/chain-roots-core.js" defer></script>
<script src="/assets/js/chain-roots.js" defer></script>
<script src="/assets/js/complex-map.js" defer></script>
<script src="/assets/js/cyclic-clock.js" defer></script>
<script src="/assets/js/divisor-mobius.js" defer></script>
<script src="/assets/js/gallery.js" defer></script>

## Current interests

- **LLM agents:** building agents that use tools well, and evaluating them honestly. My [Concurrent EDA agent](/portfolio/2026-fpga-agent/) took C code to optimized hardware designs.
- **Neurosymbolic AI:** models whose outputs can be verified. [Logic gate networks](/portfolio/2026-logic-gate-networks/) that compile to exact circuits, and [C2NN](/portfolio/2026-c2nn/), a compiler that turns C programs into neural networks.
- **AI safety and rule-following:** getting models to obey rules exactly, and finding where rules can be gamed ([Ambi](/portfolio/2026-ambi/), a loophole finder for policies).
- **Learning theory and combinatorics:** the PAC model, VC dimension, and sample complexity (I'm in Theory of Machine Learning with Michael Kearns this fall), plus real-rootedness and Möbius functions on posets.

## Elsewhere

I TA CIS 1600 (discrete math) at Penn. I was an AI engineering intern at Concurrent EDA (summer 2026), a machine learning engineer at Palm Cosmetics (computer vision, Dec 2025 – Jan 2026), and a data science research intern in CMU's REUSE program (summer 2025). The [blog](/year-archive/) has older writeups, mostly mathematical oddities from high school onward.

Full details are on my [CV](/cv/), or grab the [one-page resume (PDF)](/files/Patrick_Dugan_Resume.pdf).
