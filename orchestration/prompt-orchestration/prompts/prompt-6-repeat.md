Prompt 6 — Phase 10: Continuous Debt Resolution

Execute Phase 10 only. This prompt orchestrates repeated cycles of Phases 6–9 until the technical debt registry is empty. It is invoked after a Post-Implementation Review has been completed and unresolved debt remains.

## Available Operations

| Operation   | Scope              | Required Fields              |
| ----------- | ------------------ | ---------------------------- |
| READ_FILE   | first-party only   | path                         |
| CREATE_FILE | allowed paths only | path, content, justification |
| UPDATE_FILE | approved IDs only  | path, diff, audit ID         |

## Context Budget

- Phase summaries must be ≤500 tokens.
- Individual debt items must be ≤100 tokens.
- Summarise and persist details to docs when necessary.

## Internal Reasoning (Optional Disclosure)

Provide a concise bullet list of key assumptions, alternative interpretations and confidence drivers.

## Tasks

### Load Technical Debt Registry

- Open docs/technical-debt-registry.md or the JSON/CSV equivalent produced in earlier phases.
- Identify all outstanding items (unresolved bugs, UX issues, performance or structural improvements, missing documentation, incomplete features, gaps or missed opportunities) and note their IDs, descriptions, severities and efforts.

### Prioritise Next Cycle

- Use the severity and impact ratings to select a feasible subset of debt items to address in the next cycle.
- If the list is long, prioritise critical and high-impact items first.
- Document the selection rationale, explicitly calling out items that address testing gaps, flaky suites, or insufficient coverage.

### Re-Enter Confirmation (Phase 6)

- Summarise the selected items and present them for user confirmation.
- Update the tool selection matrix if necessary and respect Strict Mode if enabled.
- Await CONTINUE before proceeding.

### Implement Fixes (Phase 7)

- For each selected debt item, follow the standard implementation pattern: create or update code with TODO annotations for production hardening, ensure audit IDs are included in commit messages, and respect dependency and strict-mode rules.
- Add or update automated tests that validate the resolved debt, noting any remaining TODOs needed for full coverage.

### Run Post-Implementation Review (Phase 9)

- After implementation, invoke the Phase 9 prompt to verify that the fixes addressed the targeted debt items and to identify any regressions.
- Update the registry by removing resolved items and adjusting severities or efforts for partially resolved items.
- Record test execution outcomes and coverage changes produced by the cycle, adding new testing debt entries where gaps remain.

### Check for Completion

- Restart at Load Technical Debt Registry only while actionable unresolved items remain within a bounded cycle limit.
- Before starting Phase 10, set a maximum cycle count; default to three cycles when no explicit limit is provided.
- Conclude Phase 10 when all remaining items are blocked, deferred, non-actionable, outside the allowed scope, or when the user aborts.
- If the cycle limit is reached, conclude with a summary of completed work, remaining blocked or deferred items, and the next human decision required.

### Document Cycle Summary

- At the end of each cycle, append a brief summary to docs/technical-debt-registry.md or a dedicated history file (e.g. docs/debt-resolution-history.md) indicating which items were addressed, which remain, and any new issues discovered.
- Include lessons learned for future cycles.

## File Rules

- Do not modify external dependencies or submodules.
- Only first-party files may be changed, and only when tied to a specific audit ID.
- Update documentation files (docs/technical-debt-registry.md, docs/debt-resolution-history.md, README.md) as necessary to reflect progress.
- Always maintain the integrity of the audit ID system; new issues discovered during this phase must receive new IDs and be added to the registry.

## Output

- A summary of unresolved debt items at the start of the cycle and which items were selected for resolution.
- Evidence of user confirmation for the selected items (Phase 6).
- A record of implementation steps taken for each item (Phase 7) including locations and audit IDs.
- A report from the post-implementation review (Phase 9) indicating which items were fully resolved, partially resolved or remained.
- A history log update appended to the technical debt registry or debt history file.
- Testing summary for the cycle, including new or updated suites, coverage deltas, and outstanding testing debt.

## Required Response Footer

Append the standard footer defined in the meta prompt, including the proposed file changes, blockers, ready state and context consumption.
