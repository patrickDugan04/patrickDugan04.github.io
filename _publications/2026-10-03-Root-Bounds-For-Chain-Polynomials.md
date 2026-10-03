---
title: "Root Bounds for Chain Polynomials Beyond the Cohen–Macaulay World"
collection: publications
permalink: /publication/2026-10-03-Root-Bounds-For-Chain-Polynomials
excerpt: 'All real roots of the chain polynomial of every finite graded poset lie in [−4, 0]. The proof replaces shellability and h-vectors with a sign condition on a matrix inverse.'
date: 2026-10-03
venue: 'Preprint, submitted to the Electronic Journal of Combinatorics'
paperurl: '/files/Dugan_chain_polynomial_root_bounds.pdf'
citation: 'P. Dugan. &quot;Root bounds for chain polynomials beyond the Cohen–Macaulay world.&quot; Preprint, 2026.'
---

The chain polynomial of a finite poset counts its chains by size. Root bounds for it usually come from topology: shellability, Cohen–Macaulayness, and the h-vector. Graded posets need not be Cohen–Macaulay, so that route is closed for them.

This paper uses a sign condition instead. Let A be the 0/1 matrix of the strict order relation, so (I + A)⁻¹ is the Möbius function. If the entries of (I + aA)⁻¹ alternate in sign according to some 2-coloring of the elements, then every walk-counting polynomial of the graph has all its real roots in [−a, 0]. A local condition, checked one pair of vertices at a time, certifies that sign pattern.

Main results:

- [−4, 0] for the chain polynomial of **every finite graded poset**, with no minimum or maximum needed. The constant 4 is sharp.
- [−4/(q+1), 0] for the subspace lattice L<sub>n</sub>(F<sub>q</sub>), a proper subinterval of the known [−1, 0] once q ≥ 4.
- [−1, 0] for every finite Eulerian poset, and [−1/k, 0] for k-Eulerian posets, including Eulerian posets that are not Cohen–Macaulay.
- [−4, 0] for chains of iterated proper normal subgroups of any finite group. Normality isn't transitive, so this relation has no order complex, and the method still applies.

Root location also has a probabilistic reading: −c(−p) is the expected reduced Euler characteristic of a random induced subposet at density p.

## See it live {#explorer}

Your browser draws random posets below, computes each chain polynomial exactly, and plots every root in the complex plane. Real roots land on the axis (blue), complex roots scatter off it (gray), and the shaded strip is [−4, 0].

- **Graded posets:** the real roots never leave the strip. That's the theorem.
- **Any poset:** drop gradedness and real roots escape (red), sometimes far past −4. The hypothesis is doing real work.
- **Extremal family:** the de Bruijn posets of Proposition 5.7, one rank at a time. Their least root creeps toward −3.482, and as k grows that limit approaches −4, which is why the constant 4 can't be lowered.

<div class="mathfig" data-chain-roots></div>
<script src="/assets/js/chain-roots-core.js" defer></script>
<script src="/assets/js/chain-roots.js" defer></script>
