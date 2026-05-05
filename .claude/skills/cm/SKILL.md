---
name: cm
description: Generate three single-line English commit messages (concise / simple / detailed) for the current working-tree changes, let the user pick one, then run git add and git commit as separate, approval-required steps
allowed-tools: [Bash]
---

# Commit Message Generator + Committer

Generate three candidate commit messages for the current uncommitted changes, let the user choose one, then stage and commit. `git add` and `git commit` MUST be issued as separate Bash calls so the user is prompted to approve each one — never combine them into a single command, and never use any flag that bypasses approval (e.g. `--no-verify`).

## Rules for the messages

- **All three are single line only.** No body, no trailing paragraphs, no `Co-authored-by` trailer.
- **English only**, imperative mood (e.g., "Add", "Fix", "Widen"), matching the repo history style.
- Focus on the "why" / user-visible effect, not a file-by-file enumeration.
- The three patterns:
  - **concise** — shortest possible, ~50 chars, just the headline action.
  - **simple** — balanced default, ~72 chars, action + the main object/area.
  - **detailed** — single line but more specific (~100 chars max), naming the area or motivation.
- If the changes span unrelated concerns, say so and suggest splitting before proposing messages.

## Steps

1. Run in parallel:
   - `git status` — staged + unstaged + untracked files
   - `git diff` and `git diff --cached` — actual change content
   - `git log --oneline -5` — match existing message style
2. Analyze the diff for intent, not mechanics.
3. Present the three candidates as a numbered list (see Output Format).
4. Wait for the user to pick `1`, `2`, or `3` — or to provide their own message. Do not proceed without an explicit choice.
5. Once chosen, run as **separate Bash calls** (each will trigger an approval prompt):
   1. `git add <relevant files>` — prefer naming files explicitly over `git add -A` / `git add .` so secrets or stray files are not staged accidentally.
   2. `git commit -m "<chosen message>"` — pass the message via a HEREDOC if it contains special characters.
6. After the commit, run `git status` to confirm a clean tree and report the new commit's short SHA.

## Output Format

Present the candidates like this so the user can reply with just a number:

```
1. concise:  Widen main content and add column gap
2. simple:   Widen main content on wide screens and add column gap
3. detailed: Widen main content max-width on wide screens and introduce column gap for sidebar layout
```

Then ask: "Which one? (1/2/3, or paste your own)"
