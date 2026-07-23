# Prompt 4 — Phase 6–8: Confirmation, Implementation & README Consolidation

Execute Phases 6, 7 and 8 only.  Do not begin implementation until the user has explicitly confirmed the plan.

## Available Operations

| Operation     | Scope              | Required Fields              |
| ------------- | ------------------ | ---------------------------- |
| `READ_FILE`   | first‑party only   | path                         |
| `CREATE_FILE` | allowed paths only | path, content, justification |
| `UPDATE_FILE` | approved IDs only  | path, diff, audit ID         |

## Context Budget

Phase summaries ≤500 tokens; individual items ≤100 tokens.  Summarise and persist details to docs when necessary.

## Internal Reasoning (Optional Disclosure)

Record key assumptions, alternatives considered, and confidence drivers.

## Phase 6 — Confirmation & Scope Lock

1. Provide an executive summary aligned with the project goals, context, design system, technology stack, and benchmark from earlier phases.
2. Present a summary table of all identified items with ID, category, severity, impact, effort, and recommended order.
3. Generate a **Tool Selection Matrix**:
   - List each AI tool under consideration (Copilot, Cursor, Devin, Gemini Code Assist, Tabnine, Continue.dev, Replit Ghostwriter, Junie, Julie, Tembo, etc.).
   - For each, specify the role (analysis, coding, documentation, UI testing), allowed scope, strict‑mode eligibility, and any overrides.
4. Ask the user to confirm or adjust priorities, select which additional tasks (if any) to include, choose tools from the matrix, and optionally enable **Strict Mode**.
5. Do **not** proceed until the user issues `CONTINUE` or `CONTINUE NO FILE CHANGES`.  If they choose `REVISE`, incorporate their instructions and rerun this phase.

## Phase 7 — Implementation (POC → Production)

Once the user has confirmed the scope:

1. Create a phased implementation plan:
   - Critical bug and security fixes.
   - UX and accessibility improvements aligned with the design system.
   - Performance and structural changes.
   - Refactoring and technical debt reduction.
   - New feature implementations.
   - Additional tasks approved in Phase 6.
2. For each item, provide POC‑level code or configuration demonstrating the solution approach:
   - Include inline TODO comments marking areas requiring production hardening.
   - Document implementation decisions and trade‑offs inline.
   - Identify integration points with existing systems.
   - Add or update automated tests (unit, integration, end-to-end, accessibility) that demonstrate coverage for the change; if a final test cannot be completed, scaffold the test with TODO markers describing the remaining work.
3. **Respect Strict Mode**:
   - Do not call Copilot or other code generation tools when Strict Mode is enabled.
   - Refuse framework rewrites or dependency updates.
   - Require an audit ID for every change.
   - Annotate all POC code with TODO markers.
4. Integrate UI snapshot tests into the CI pipeline, ensuring deterministic results.
5. Ensure all new or modified tests execute locally and in CI, documenting any required data seeding or fixtures.
6. Record a lightweight decision record for any significant choice (`docs/decisions/DEC-xxx-<short-name>.md`), capturing rationale, testing impact, and follow-up TODOs for production hardening.

## Phase 8 — README Consolidation & Knowledge Capture

After implementation:

1. Enhance `README.md` to serve as the authoritative entry point:
   - Project overview and business context.
   - Design system & visual identity.
   - Technology stack and architecture overview.
   - Development setup, testing, and deployment instructions.
   - Document automated test suites (unit, integration, e2e, visual, accessibility), execution commands, and expected coverage thresholds.
   - Design system usage guidelines and snapshot test location.
   - Security, performance, and observability notes.
   - Contribution guidelines and code quality standards.
   - Technical debt registry and planned future work.
   - Links to additional documentation (API docs, architecture diagrams, design specs, moodboards, AI tool analysis).
2. Maintain a `docs/technical-debt-registry.md` enumerating all incomplete features and TODOs, organised by priority and effort.
3. Capture phase summaries and decisions in docs to enable cross‑session persistence without relying on transient model memory.
4. Update or create testing guides (e.g. `docs/testing-strategy.md`) when implementation introduces new suites or alters coverage expectations.

## File Rules

- Only modify files that were approved in previous phases and have corresponding audit IDs.
- Record all changes with explicit justification and associated audit IDs.
- Do not silently alter external dependencies, packages, or submodules.

## Output

- Confirmation summary and updated priorities.
- Tool selection matrix with final choices.
- Implementation plan with POC code snippets and TODO annotations.
- Automated test additions or scaffolds linked to each implemented item.
- Enhanced README outline and technical debt registry.
- Decision records (if created).

## Required Response Footer

_(Append the standard footer defined in the meta prompt.)_