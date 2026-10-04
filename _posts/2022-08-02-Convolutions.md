---
title: "Dirichlet Convolutions"
date: 2022-08-02
permalink: /posts/2022/08/Convolutions/
tags:
  - Math
  - Number Theory
  - Algebra
---

An introduction to Dirichlet convolution, written the summer after my junior year of high school. I knew the Möbius function existed but deliberately didn't look up its definition, so I could try to reconstruct it from what it had to do: invert the constant-one function under convolution. The write-up builds up from that.

Looking back, this is where my interest in Möbius functions started. They're the main tool in my [chain polynomial paper](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials), which uses the Möbius function of a poset, and of graphs more generally, to locate real roots.

## See it

Below is the divisor lattice of n. Each node is a divisor d, coloured by μ(d): blue for +1, red for −1, hollow for 0. The line underneath checks Σ<sub>d|n</sub> μ(d) = 0 and uses Möbius inversion to recover φ(n) from n = Σ<sub>d|n</sub> φ(d).

Click a divisor d to highlight the interval [d, n]. The widget then computes the Möbius function of that interval as a poset, from its recursion alone, and it always comes out to μ(n/d). That's the bridge from this post to my [paper](/publication/2026-10-03-Root-Bounds-For-Chain-Polynomials): the Möbius function of a poset generalizes this one, and its signs are what the paper uses to locate roots.

<div class="mathfig" data-divisor-mobius></div>
<script src="/assets/js/divisor-mobius.js" defer></script>

[Read the write-up (PDF)](/files/Dirichlet_convolution.pdf)
