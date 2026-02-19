# Agent Instructions

## OpenSpec Workflow
1. **Read** `openspec/project.md` for project context
2. **Check** `openspec/specs/` for current system behavior
3. **Check** `openspec/changes/` for in-progress changes
4. **Before coding**: ensure a spec exists for what you're building
5. **After completing a change**: move it to `changes/archive/`

## Conventions
- Specs define WHAT and WHY (behavior contracts)
- Design docs define HOW (implementation details)
- Use `### Requirement:` + `#### Scenario:` format
- Use GIVEN/WHEN/THEN keywords in scenarios
- Keep specs focused on one capability each

## Change Workflow
1. Create `changes/<change-name>/proposal.md`
2. Add `tasks.md` with implementation checklist
3. Optionally add `design.md` for technical decisions
4. Add `specs/<capability>/spec.md` for the future state
5. Implement, then archive to `changes/archive/YYYY-MM-DD-<name>/`
