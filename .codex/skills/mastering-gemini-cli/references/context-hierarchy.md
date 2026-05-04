# Context Hierarchy Reference

> **Load when:** User asks about GEMINI.md, settings.json, configuration precedence, or context files.

Configuration precedence and context file patterns for Gemini CLI.

## Contents

- [Configuration Precedence](#configuration-precedence)
- [GEMINI.md Context Files](#geminimd-context-files)
- [settings.json Configuration](#settingsjson-configuration)
- [Environment Variables](#environment-variables)
- [Modular Context Patterns](#modular-context-patterns)

---

## Configuration Precedence

Settings resolve in order (higher numbers override lower):

```
1. Default values (hardcoded)
2. /etc/gemini-cli/system-defaults.json (system base)
3. ~/.gemini/settings.json (user preferences)
4. .gemini/settings.json (project settings)
5. /etc/gemini-cli/settings.json (enterprise override)
6. Environment variables
7. Command-line arguments (highest priority)
```

### Practical Example

```json
// ~/.gemini/settings.json (user)
{ "useSmartEdit": false }

// .gemini/settings.json (project)
{ "useSmartEdit": true }

// Result: useSmartEdit = true (project overrides user)
```

---

## GEMINI.md Context Files

### File Locations

| Location | Scope | Purpose |
|----------|-------|---------|
| `~/.gemini/GEMINI.md` | Global | User preferences across all projects |
| `./GEMINI.md` | Project | Repository-specific rules |

**Resolution:** Project GEMINI.md augments (not replaces) global.

### Structure Template

```markdown
# Project Context

## Role
You are a [role description].

## Task
[Primary objective]

## Constraints
- [What NOT to do]
- [Boundaries]

## Style
- [Code formatting rules]
- [Naming conventions]

## Domain Knowledge
[Project-specific facts]
```

### Example: Node.js API Project

```markdown
# Project Context

## Role
You are a Senior Backend Engineer maintaining a Node.js REST API.

## Constraints
- Never modify files in /migrations
- Never change database connection strings
- Always preserve existing error handling patterns

## Style
- 2 spaces indentation
- Single quotes for strings
- Async/await over callbacks

## Domain Knowledge
- Database: PostgreSQL via Prisma ORM
- Auth: JWT tokens in httpOnly cookies
- Tests: Jest with supertest
```

---

## settings.json Configuration

### File Locations

| Location | Scope |
|----------|-------|
| `~/.gemini/settings.json` | User defaults |
| `.gemini/settings.json` | Project overrides |

### Critical Keys for Headless

```json
{
  "useSmartEdit": true
}
```

### Key Reference

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `useSmartEdit` | boolean | false | Fuzzy matching for Edit tool |
| `output` | string | "text" | Default output format |
| `context.fileName` | string | "GEMINI.md" | Custom context file name |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | API authentication |
| `GEMINI_SYSTEM_MD` | Path to custom system prompt |
| `GEMINI_DEBUG` | Enable debug output |

### Custom System Prompt

```bash
export GEMINI_SYSTEM_MD=/path/to/custom-system.md
gemini -p "Task"
```

---

## Modular Context Patterns

### @file Import Syntax

Include external files in GEMINI.md:

```markdown
# Project Context

@./docs/api-schema.md
@./docs/coding-standards.md
```

### Dynamic Context Injection

```bash
# Generate fresh database schema
pg_dump --schema-only > .gemini/db-schema.md

# GEMINI.md references it
# @.gemini/db-schema.md
```

### Multi-Persona Setup

```
project/
├── GEMINI.md              # Default persona
├── .gemini/
│   ├── settings.json
│   ├── refactor-agent.md  # Refactoring specialist
│   ├── docs-agent.md      # Documentation writer
│   └── test-agent.md      # Test generator
```

Switch personas:

```bash
GEMINI_SYSTEM_MD=.gemini/refactor-agent.md gemini -p "Convert to async"
GEMINI_SYSTEM_MD=.gemini/docs-agent.md gemini -p "Update README"
```

---

## Quick Setup Checklist

```
- [ ] Create .gemini/settings.json with useSmartEdit: true
- [ ] Create GEMINI.md with role/task/constraints
- [ ] Add @imports for large reference docs
- [ ] Test with gemini -p "Describe your role"
```

---

## Troubleshooting

### Agent Ignores GEMINI.md

**Check:** File is named exactly `GEMINI.md` (case-sensitive)

### @import Not Working

**Check:** Path is relative with `./` prefix

```markdown
# GOOD
@./docs/schema.md

# BAD
@docs/schema.md
```

### Settings Not Applying

**Check:** JSON syntax is valid

```bash
cat .gemini/settings.json | jq .
```
