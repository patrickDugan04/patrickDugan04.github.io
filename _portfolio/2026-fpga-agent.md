---
title: "LLM agent for FPGA design (Concurrent EDA)"
excerpt: "An agent that runs the FPGA loop end to end: HDL generation, synthesis, optimization."
collection: portfolio
date: 2026-08-01
---

Built during my summer 2026 internship at Concurrent EDA. The agent combines LLM reasoning with MLIR/LLVM compiler passes and a custom MCP tool server, and iterates on designs using automated optimization passes and design-analysis heuristics.

Compared with an unassisted LLM baseline, it used 16× fewer tokens, cut design-iteration time by 30–40%, and raised the share of generated HDL that synthesizes from 80% to 100%.

**Stack:** MLIR, LLVM, Python, MCP.
