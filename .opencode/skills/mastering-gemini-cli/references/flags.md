# Gemini CLI Flags Reference

> **Load when:** User asks about specific flags, flag combinations, or command-line syntax.

Complete reference for headless automation flags.

## Contents

- [Core Flags](#core-flags)
- [Permission Flags](#permission-flags)
- [Output Flags](#output-flags)
- [Context Flags](#context-flags)
- [Session Flags](#session-flags)
- [Debugging Flags](#debugging-flags)

---

## Core Flags

### --prompt, -p

Pass query non-interactively.

```bash
gemini -p "Explain this code"
gemini --prompt "Refactor to async/await"
```

**Best practice:** Use quotes to prevent shell expansion.

```bash
# GOOD
gemini -p "Fix the bug in src/*.js"

# BAD - shell expands glob before gemini sees it
gemini -p Fix the bug in src/*.js
```

---

## Permission Flags

### --approval-mode

Controls tool execution permissions.

| Value | File Ops | Shell Cmds | Headless Viability |
|-------|----------|------------|-------------------|
| (default) | ❌ Prompts | ❌ Prompts | None - hangs |
| `auto_edit` | ✅ Auto | ❌ Prompts | High |
| `yolo` | ✅ Auto | ✅ Auto | Maximum (risky) |

```bash
# Safe for code refactoring
gemini -p "Fix linting errors" --approval-mode auto_edit

# Full autonomy (sandbox only)
gemini -p "Run tests and fix failures" --approval-mode yolo
```

### --allowed-tools

Whitelist specific tool capabilities.

```bash
# Read-only agent
gemini -p "Analyze security" --allowed-tools "ReadFile"

# Read + write, no shell
gemini -p "Update docs" --allowed-tools "ReadFile,WriteFile"

# Read + edit, no shell
gemini -p "Refactor code" --allowed-tools "ReadFile,Edit"
```

**Available tools:** ReadFile, WriteFile, Edit, RunShell, WebSearch

---

## Output Flags

### --output-format

Controls response structure.

| Value | Description | Use Case |
|-------|-------------|----------|
| `text` | Plain text (default) | Human reading |
| `json` | Structured JSON | Script parsing |
| `stream-json` | Newline-delimited JSON | Real-time UIs |

```bash
# Parse in scripts
gemini -p "List files" --output-format json | jq '.response'

# Real-time streaming
gemini -p "Long task" --output-format stream-json
```

**JSON structure:**

```json
{
  "response": "Final answer text",
  "tool_calls": [...],
  "reasoning": "..."
}
```

---

## Context Flags

### --include-directories

Recursively grant read access to directories.

```bash
# Single directory
gemini -p "Refactor utils" --include-directories src/utils

# Multiple directories
gemini -p "Update imports" \
  --include-directories src \
  --include-directories lib
```

### --include-all-files

Grant access to all files in current directory (recursive).

```bash
gemini -p "Find TODOs" --include-all-files
```

**Warning:** Large directories consume token budget and degrade reasoning.

**Recommended:** Use selective `--include-directories` instead.

---

## Session Flags

### --resume, -r

Continue previous session with preserved context.

```bash
# Resume most recent session
gemini -p "Continue the refactoring" --resume latest

# Resume specific session by UUID
gemini -p "Continue" --resume abc12345-def6-7890-ghij-klmnopqrstuv
```

**Use case:** Multi-step workflows where later steps need earlier context.

```bash
# Step 1: Analyze
gemini -p "Analyze codebase structure" --output-format json > step1.json

# Step 2: Plan (with Step 1 context)
gemini -p "Create refactoring plan" --resume latest

# Step 3: Execute (with Steps 1+2 context)
gemini -p "Execute the plan" --resume latest --approval-mode auto_edit
```

---

## Debugging Flags

### --debug, -d

Expose raw Client ↔ Core traffic.

```bash
gemini -p "Edit file" --debug
```

**Diagnostics:**

```bash
# See what old_string the model proposed
gemini -p "Edit auth.js" --debug 2>&1 | grep "old_string"

# Check tool call sequence
gemini -p "Refactor" --debug 2>&1 | grep "FunctionCall"
```

---

## Flag Combinations

### Headless CI/CD Pipeline

```bash
gemini -p "Run tests and fix failures" \
  --approval-mode yolo \
  --output-format json \
  --include-directories src \
  --include-directories tests
```

### Safe Code Refactoring

```bash
gemini -p "Convert callbacks to async/await" \
  --approval-mode auto_edit \
  --allowed-tools "ReadFile,Edit" \
  --include-directories src
```

### Multi-Step Workflow

```bash
# Step 1
gemini -p "Analyze code quality" \
  --output-format json \
  --include-directories src > analysis.json

# Step 2
gemini -p "Fix top 3 issues from analysis" \
  --resume latest \
  --approval-mode auto_edit
```

### Documentation Agent

```bash
gemini -p "Update README from source code" \
  --approval-mode yolo \
  --allowed-tools "ReadFile,WriteFile" \
  --include-directories src
```

---

## Quick Reference Table

| Flag | Short | Purpose |
|------|-------|---------|
| `--prompt` | `-p` | Non-interactive query |
| `--approval-mode` | — | Permission level |
| `--allowed-tools` | — | Whitelist capabilities |
| `--output-format` | — | Response structure |
| `--include-directories` | — | Grant directory access |
| `--include-all-files` | — | Grant current dir access |
| `--resume` | `-r` | Continue session |
| `--debug` | `-d` | Verbose diagnostics |
