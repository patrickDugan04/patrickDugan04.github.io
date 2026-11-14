---
title: "Neurosymbolic logic gate networks"
excerpt: "Neural networks that learn as circuits, compress themselves with logic synthesis, and come with provable guarantees."
collection: portfolio
date: 2026-09-01
---

Differentiable logic gate networks learn by relaxing each neuron into a soft two-input Boolean gate, which later hardens into a real circuit. I run logic synthesis on the hardened circuit between gradient steps, so the model keeps re-compressing what it has learned.

Where gradient descent stalls, as it does on parity, an exact GF(2) solver takes over and recovers the function from about n+1 examples. Alternating the two beats either one alone. The finished model is a small circuit that decompiles to a rule set with provable output guarantees.

**Stack:** PyTorch, Python. In progress.
