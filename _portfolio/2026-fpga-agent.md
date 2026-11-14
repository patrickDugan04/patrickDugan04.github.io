---
title: "LLM agent for FPGA design (Concurrent EDA)"
excerpt: "An agent that runs the FPGA loop end to end: HDL generation, synthesis, optimization."
collection: portfolio
date: 2026-08-01
---

Built during my summer 2026 internship at Concurrent EDA. I pitched it and built it solo. The agent takes C code, runs it through high-level synthesis, and iterates on the hardware design using custom agent skills and tool scripts, MLIR/LLVM program analysis, and a library of code transforms. I also built a 100+ task benchmark to evaluate it, and used it to A/B test prompts, tools, and transforms. The prototype was chosen for production.

Compared with an unassisted LLM baseline, it used 16× fewer tokens, cut design-iteration time by 30–40%, and raised the share of generated HDL that synthesizes from 80% to 100%.

**Stack:** Python, LLM agents, MLIR, LLVM, Vitis HLS, Bambu HLS.
