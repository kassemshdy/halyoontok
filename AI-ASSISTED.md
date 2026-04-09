# AI-Assisted Development Guide

This document explains how AI coding tools (Claude Code, Cursor) are configured in this repository.

## Configuration Files Overview

| File | Tool | Purpose |
|------|------|---------|
| `CLAUDE.md` | Claude Code | Project-level instructions loaded automatically |
| `AGENTS.md` | Cursor | Project-level instructions loaded automatically |
| `PATTERNS.md` | Both | Implementation patterns and code examples |
| `.claude/settings.local.json` | Claude Code | Permissions and allowed commands |
| `.claude/skills/` | Claude Code | Specialized skill guides (e.g., Playwright) |
| `.cursor/mcp.json` | Cursor | MCP server configurations |

## CLAUDE.md vs AGENTS.md

Both serve the same purpose — they provide project context to AI coding tools. The difference is which tool reads them:

- **Claude Code** reads `CLAUDE.md`
- **Cursor** reads `AGENTS.md`

In this repo, `AGENTS.md` is a symlink to `CLAUDE.md` so both tools get identical instructions. Edit `CLAUDE.md` and both stay in sync.

### What goes in CLAUDE.md / AGENTS.md
- Project overview and architecture
- Build, test, lint commands
- Key patterns and rules (e.g., "never use raw HTTPException")
- Links to deeper docs like `PATTERNS.md`

### What does NOT go in CLAUDE.md / AGENTS.md
- Full code examples (put those in `PATTERNS.md`)
- Deployment runbooks
- Business logic documentation

## Nested CLAUDE.md / AGENTS.md

AI tools also look for these files in subdirectories. When working in a subdirectory, the tool loads both the root file AND the local one.

| File | Scope |
|------|-------|
| `/CLAUDE.md` | Loaded for all work in the repo |
| `/frontend/apps/admin/CLAUDE.md` | Loaded additionally when working in admin/ |
| `/frontend/apps/admin/AGENTS.md` | Same content, for Cursor |

### Current nested files

- **`frontend/apps/admin/CLAUDE.md`** + **`AGENTS.md`** — Frontend standards: RTL layout, shadcn/ui, import conventions, API proxy rules, Tailwind patterns

Add more nested files as the project grows. For example, `backend/CLAUDE.md` for backend-specific conventions that don't belong in the root file.

## Claude Code Memory

Claude Code has a persistent memory system at `~/.claude/projects/<project>/memory/`. This stores:

- **User preferences** — how you like to work, your role, expertise
- **Feedback** — corrections and confirmed approaches ("don't do X", "yes keep doing Y")
- **Project context** — decisions, deadlines, who is working on what
- **References** — links to external systems (Linear, Slack, Grafana, etc.)

Memory persists across conversations. Claude Code automatically recalls relevant memories in future sessions.

### What gets saved to memory
- Your corrections ("don't mock the database in tests")
- Confirmed approaches ("single bundled PR was the right call")
- Project decisions ("merge freeze after Thursday")
- Your role and preferences

### What does NOT get saved to memory
- Code patterns (that's what `PATTERNS.md` is for)
- File structure (discoverable by reading the code)
- Git history (use `git log`)
- Temporary task details

## Skills

Skills are specialized guides that teach the AI how to handle specific tasks. They live in `.claude/skills/` and `.cursor/skills/`.

### Current skills

| Skill | File | Purpose |
|-------|------|---------|
| Playwright | `.claude/skills/playwright/SKILL.md` | E2E testing guide: test layout, auth strategy, locators, best practices |

### Adding a new skill

Create a `SKILL.md` in `.claude/skills/<skill-name>/`:

```
.claude/skills/
├── playwright/
│   └── SKILL.md
└── new-skill/
    └── SKILL.md
```

## MCP Servers

MCP (Model Context Protocol) servers give AI tools access to external services. Configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
  }
}
```

Current MCP servers:
- **Playwright** — browser automation for testing

Add more as needed (e.g., Linear for issue tracking, Figma for designs).

## Allowed Commands

Claude Code requires permission for shell commands. Permissions are configured in `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(ln:*)"
    ]
  }
}
```

### Recommended permissions for this project

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(cd:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(find:*)",
      "Bash(mkdir:*)",
      "Bash(ln:*)",
      "Bash(pip install:*)",
      "Bash(pnpm:*)",
      "Bash(npx:*)",
      "Bash(pytest:*)",
      "Bash(ruff:*)",
      "Bash(alembic:*)",
      "Bash(uvicorn:*)",
      "Bash(docker compose:*)",
      "Bash(celery:*)"
    ]
  }
}
```

## GitHub Actions

AI-related CI runs on every PR:

| Workflow | What it does |
|----------|-------------|
| `pr-tests.yml` | Ruff lint, frontend lint, backend pytest |
| `pr-playwright-tests.yml` | E2E browser tests (admin + exclusive projects) |

## How It All Fits Together

```
Developer opens repo in Claude Code or Cursor
    │
    ├── Tool reads CLAUDE.md / AGENTS.md (project context)
    ├── Tool reads nested CLAUDE.md in current subdirectory
    ├── Tool loads relevant skills from .claude/skills/
    ├── Tool connects to MCP servers from .cursor/mcp.json
    ├── Tool recalls memories from previous conversations
    │
    └── When implementing features:
        └── Follows patterns from PATTERNS.md
```
