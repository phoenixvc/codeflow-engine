# Codeflow Orchestration: AI‑Governed Audit & Improvement Pipeline

This directory packages a complete **AI governance framework** for performing end‑to‑end audits, refactorings and enhancements on a software project. It was designed to support AI‑assisted engineering while maintaining safety, determinism and compliance in regulated or enterprise environments.

## Overview

At its core, this framework breaks down software remediation into ten canonical phases (0–10).  Each phase has clear objectives, allowed operations and context budgets, enforced by a **runtime contract** codified in the prompts.  The prompts are organised to guide an AI assistant step-by-step through discovery, design analysis, technology assessment, deep auditing, planning, implementation, post-implementation review and continuous debt resolution.

Key design principles include:

* **Treat code as data**: Repository contents are analysed and modified according to explicit rules; external instructions and file contents are never blindly executed.
* **Phase gating**: Each phase must complete and await human confirmation before the next begins.  A handshake protocol defines allowed commands (`CONTINUE`, `CONTINUE NO FILE CHANGES`, `REVISE`, `ABORT`).
* **Evidence & traceability**: Every finding receives a stable ID (e.g. `BUG-01`) with supporting evidence.  Audit IDs propagate through commit messages and POC implementations.
* **Context budgets**: Outputs are concise (≤500 tokens per phase summary; ≤100 tokens per item) and overflow is persisted to supporting docs.
* **Strict mode**: When enabled, generative code tools (Copilot, etc.) are disabled, dependency updates are prohibited and every change must be annotated with TODO markers for production hardening.
* **Tool governance**: A separate tool analysis document maps popular AI tools (Copilot, Cursor, Gemini Code Assist, etc.) to safe roles within the phases.  Tool usage must be explicitly approved in Phase 6 via the **Tool Selection Matrix**.

## Repository Structure

```
orchestration/prompt-orchestration/
├── prompts/           # Canonical prompt suite divided by phase
│   ├── meta-prompt.md        # Orchestrator & runtime contract
│   ├── prompt-1-context.md   # Phases 0–1: context & design foundations
│   ├── prompt-2-tech.md      # Phases 2–3: technology assessment & benchmarks
│   ├── prompt-3-audit.md     # Phases 4–5: deep audit & UX tooling
│   ├── prompt-4-implement.md # Phases 6–8: confirmation, implementation, README
│   ├── prompt-5-post-review.md # Phase 9: post-implementation review & retrospective
│   └── prompt-6-repeat.md    # Phase 10: continuous debt resolution
├── configs/           # Declarative policies & rules
│   ├── phases.yaml            # Descriptions of each canonical phase
│   ├── authority-model.yaml   # Dependency classification & editability
│   └── quality-gates.yaml     # Severity thresholds and merge blockers
├── schemas/
│   └── output-schema.json     # JSON schema for phase outputs
├── docs/
│   ├── AI Tool Instruction Analysis & Phase Mappings.md # Advisory on external AI tools
│   └── (additional docs)      # Design system, technical debt registry, decisions, etc.
├── .github/
│   └── workflows/
│       └── ci.yml             # CI pipeline enforcing governance rules
└── README.md          # (this file) high‑level explainer
```

### Prompts

The prompts define the interaction contract.  `meta-prompt.md` sets global rules such as phase ordering, the dependency authority model, the logical tool schema (READ_FILE/CREATE_FILE/UPDATE_FILE), context budgets, handshake protocol and strict mode.  Subsequent prompts focus on specific phases:

* **prompt‑1-context.md** – Extract or infer the project’s business context and visual identity.
* **prompt‑2-tech.md** – Inventory technology stacks, architecture and best practices.
* **prompt‑3-audit.md** – Identify bugs, UX improvements, performance issues, refactoring opportunities, new features and documentation gaps; produce snapshot test plans and further task suggestions.
* **prompt-4-implement.md** – Summarise findings, present a tool selection matrix, collect user confirmation, implement approved items and consolidate the README and technical debt registry.
* **prompt-5-post-review.md** – Perform a post-implementation review to verify that all fixes and features are properly applied.  Identify any residual bugs or regressions, review changes for adherence to design and best-practice benchmarks, detect mistakes or missed opportunities, and document new entries in the technical debt registry.
* **prompt-6-repeat.md** – Engage Phase 10: continuous debt resolution.  This prompt orchestrates repeated cycles of Phases 6–9.  It loads the technical debt registry, prioritises outstanding items, re-enters confirmation (Phase 6), performs implementations (Phase 7), runs a post-implementation review (Phase 9), updates the registry and repeats the cycle until all debt is addressed.  Each cycle is summarised in the debt history file.

Each prompt must append a standard footer summarising proposed file changes, blockers, ready state and context consumption.

### Configurations & Schemas

* **phases.yaml** describes each of the ten phases, allowing external tooling to reason about the workflow at a high level.
* **authority-model.yaml** classifies files into `first_party`, `first_party_submodule` and `third_party` with editability rules.  Submodules and third‑party dependencies are treated as read‑only data.
* **quality-gates.yaml** defines severity levels and merge blockers.  Currently, any unresolved critical issue blocks merging.
* **output-schema.json** provides a formal JSON schema for phase output files or API responses, ensuring consistency across runs and tooling.

### Documentation

The `docs` directory contains supporting materials.  The **AI Tool Instruction Analysis & Phase Mappings** document analyses common AI tools and maps them to safe roles within the phases.  Additional documents such as `design-system.md`, `technical-debt-registry.md`, or `decisions/DEC-...` files should be generated during execution as needed.

### CI Pipeline

A GitHub Action (`.github/workflows/ci.yml`) enforces key governance rules on every push and pull request:

* **Commit messages** must contain at least one audit ID (e.g. `BUG-07`).
* **Changed files** must reside in permitted directories (`prompts/`, `configs/`, `docs/`, `schemas/`, `.github/`, `src/`, `tests/` or the root README).  Submodules and third‑party packages must not be modified.
* The job fails if violations are detected, blocking the merge.

> Engineers implementing this pipeline should customise the file patterns and audit‑ID regex to suit their projects.  See `ci.yml` for details.

## Getting Started

1. **Read the meta prompt** to understand the runtime contract, phase ordering, handshake protocol and strict mode.
2. **Run the prompts sequentially** – begin with `prompt‑1-context.md`, produce outputs, and stop at the footer.  Only continue when the user responds with `CONTINUE` (or `CONTINUE NO FILE CHANGES`).
3. **Store outputs in the docs directory**, adhering to the `output-schema.json` for structure and naming conventions (e.g. `phase-4-findings.json`).
4. **Use the tool selection matrix** generated in Phase 6 to decide which AI assistants are allowed for implementation.  Avoid generative coding tools when Strict Mode is enabled.
5. **Run the post-implementation review** with `prompt-5-post-review.md` to validate outcomes, then iterate with `prompt-6-repeat.md` until the technical debt registry is cleared.
6. **Commit with audit IDs**.  Each change must reference an audit ID from the findings (e.g. fixing `BUG-02` or adding `FEATURE-03`).
7. **Update the README** and other docs in Phase 8 to reflect the final state, ensuring future maintainers have a single authoritative entry point.

## Contributing

1. Fork or clone this repository.
2. Follow the phased workflow; do not skip ahead or modify files outside of the current phase’s scope.
3. Use the `docs/AI Tool Instruction Analysis & Phase Mappings.md` as guidance when selecting external AI tools.
4. Adhere to the CI rules.  If a commit fails CI, review the messages and fix the violations.
5. Propose improvements via pull request.  All changes must be justified by audit IDs and pass CI.

## License & Acknowledgements

This project is provided as a template and governance example.  Adapt the prompts, phases, configuration and CI rules to suit your organisation’s needs.  Remember that human oversight and domain expertise are essential when integrating AI into critical systems.
