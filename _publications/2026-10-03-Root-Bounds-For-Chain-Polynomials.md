---
title: "Sign Patterns of Möbius Functions and Positivity of Shifted Chain and Walk Polynomials"
collection: publications
permalink: /publication/2026-10-03-Root-Bounds-For-Chain-Polynomials
excerpt: 'All real roots of the chain polynomial of every finite graded poset lie in [−4, 0]. The proof replaces shellability and h-vectors with a sign pattern of the Möbius function, and finds the best constants for when that pattern holds.'
date: 2026-10-03
venue: 'Preprint (revised November 2026)'
paperurl: '/files/Dugan_chain_polynomial_root_bounds.pdf'
citation: 'P. Dugan. &quot;Sign Patterns of Möbius Functions and Positivity of Shifted Chain and Walk Polynomials.&quot; Preprint, 2026.'
---

The chain polynomial of a finite poset counts its chains by size. Root bounds for it usually come from topology: shellability, Cohen–Macaulayness, and the h-vector. Graded posets need not be Cohen–Macaulay, so that route is closed for them.

This paper uses a sign pattern instead. Let A be the 0/1 matrix of the strict order relation, so (I + A)⁻¹ is the Möbius function. The same inverse makes sense for any acyclic directed graph. If the entries of (I + aA)⁻¹ alternate in sign according to some 2-coloring of the vertices, then every walk-counting polynomial of the graph has its real roots in [−a, 0]. So do all of its derivatives.

The paper also settles when that sign pattern shows up, with the best possible constants.

Main results:

- A directed acyclic graph has the sign pattern at some scale exactly when its transitive reduction is bipartite, and then the scale κ = 4.7305… is enough. That constant is optimal.
- For posets, the condition is that all maximal chains have sizes of the same parity. Then the scale 4cos²(π/(d+2)) is enough, where d is the length of the longest chain. That constant is optimal too.
- So the chain polynomial of **every finite graded poset** has its real roots in [−4, 0]. No rank function or Cohen–Macaulay condition is needed.
- Frobenius complexes of a numerical semigroup with odd generators get the same [−4, 0]. If the smallest generator is even, the real roots are unbounded below.
- For graded posets, a rescaled h-vector is nonnegative. That can fail once gradedness is dropped.

This is a revised version of the October 2026 preprint *Root Bounds for Chain Polynomials Beyond the Cohen–Macaulay World*.

## See it live {#explorer}

Your browser draws random posets below, computes each chain polynomial exactly, and plots every root in the complex plane. Real roots land on the axis (blue), complex roots scatter off it (gray), and the shaded strip is [−4, 0].

- **Graded posets:** the real roots never leave the strip. That's the theorem.
- **Any poset:** drop gradedness and real roots escape (red), sometimes far past −4. The hypothesis is doing real work.
- **Extremal family:** the de Bruijn posets of Proposition 5.7, one rank at a time. Their least root creeps toward −3.482, and as k grows that limit approaches −4, which is why the constant 4 can't be lowered.

<div class="mathfig" data-chain-roots></div>
<script src="/assets/js/chain-roots-core.js" defer></script>
<script src="/assets/js/chain-roots.js" defer></script>
