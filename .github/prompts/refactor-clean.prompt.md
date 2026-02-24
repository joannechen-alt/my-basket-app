# Refactor & Clean Prompt

## Mission
Improve readability, maintainability, and performance **without changing observable behavior**.

## Inputs To Provide
- Files/modules in scope
- Current pain points (bugs, slow build, duplication)
- Constraints (public APIs, deadlines, style rules)
- Test strategy (unit/integration/manual checks)

## Guardrails
1. Preserve behavior; add characterization tests before risky changes.
2. Prefer small, reviewable diffs with a single intent (rename, extract, delete dead code).
3. Avoid adding dependencies unless clearly justified.
4. Update docs when structure/contracts change.
5. Validate with tests; include before/after notes when measurable.

## Deliverables
- Summary of changes and rationale
- Diffs for refactors
- Test evidence
- Follow-up backlog items

## Output Format
- Provide: (1) what changed, (2) why, (3) risks, (4) next steps.