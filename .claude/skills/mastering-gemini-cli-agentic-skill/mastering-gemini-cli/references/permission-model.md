# Permission Model Reference

> **Load when:** User asks about file access, approval modes, security, or why scripts hang.

Gemini CLI's security architecture for file and shell access.

## Contents

- [Explicit Consent Model](#explicit-consent-model)
- [Approval Modes](#approval-modes)
- [Tool Whitelisting](#tool-whitelisting)
- [Security Patterns](#security-patterns)
- [Troubleshooting](#troubleshooting)

---

## Explicit Consent Model

Gemini operates on **explicit consent** — the agent cannot see your filesystem by default.

### What Agent Can See

| Source | Visibility |
|--------|------------|
| Files mentioned in prompt | ✅ Readable |
| Files in `--include-directories` | ✅ Readable |
| Files requested via ReadFile tool | ⚠️ Depends on approval mode |
| All other files | ❌ Invisible |

### Why This Matters

```bash
# Agent CAN see index.js (mentioned in prompt)
gemini -p "Fix bug in index.js"

# Agent CANNOT see utils.js unless:
# 1. Mentioned in prompt
# 2. Included via --include-directories
# 3. Agent requests it AND approval mode allows
```

**Implication:** If agent needs to navigate codebase, grant visibility upfront.

---

## Approval Modes

### Default Mode (Interactive Only)

```bash
gemini -p "Edit file"  # No --approval-mode flag
```

| Action | Behavior |
|--------|----------|
| ReadFile (new) | Prompts for approval |
| Edit | Prompts for approval |
| WriteFile | Prompts for approval |
| RunShell | Prompts for approval |

**Headless viability:** ❌ Zero — script hangs waiting for input.

### auto_edit Mode

```bash
gemini -p "Refactor code" --approval-mode auto_edit
```

| Action | Behavior |
|--------|----------|
| ReadFile | ✅ Auto-approved |
| Edit | ✅ Auto-approved |
| WriteFile | ✅ Auto-approved |
| RunShell | ❌ Prompts for approval |

**Headless viability:** ✅ High — safe for code automation.

**Use cases:**
- Code refactoring
- Documentation updates
- File reorganization
- Any task not requiring shell commands

### yolo Mode

```bash
gemini -p "Run tests, fix failures" --approval-mode yolo
```

| Action | Behavior |
|--------|----------|
| ReadFile | ✅ Auto-approved |
| Edit | ✅ Auto-approved |
| WriteFile | ✅ Auto-approved |
| RunShell | ✅ Auto-approved |

**Headless viability:** ✅ Maximum — fully autonomous.

**Risk:** Agent has same privileges as invoking user.

**Dangerous commands agent could execute:**
```bash
rm -rf /          # Delete everything
git push --force  # Overwrite remote
curl | bash       # Execute remote code
```

**Rule:** Use yolo ONLY in:
- Docker containers
- Ephemeral CI runners
- VMs with snapshots
- Sandboxed environments

---

## Tool Whitelisting

### --allowed-tools Flag

Restrict agent capabilities regardless of approval mode.

```bash
gemini -p "Task" --approval-mode yolo --allowed-tools "ReadFile,WriteFile"
```

### Available Tools

| Tool | Purpose | Risk Level |
|------|---------|------------|
| ReadFile | Read file contents | Low |
| WriteFile | Create/overwrite files | Medium |
| Edit | Surgical file modification | Medium |
| RunShell | Execute terminal commands | High |
| WebSearch | Search the web | Low |

### Least Privilege Patterns

**Read-only analyst:**
```bash
--allowed-tools "ReadFile"
```

**Documentation agent:**
```bash
--allowed-tools "ReadFile,WriteFile"
```

**Code refactoring agent:**
```bash
--allowed-tools "ReadFile,Edit"
```

**Test runner (dangerous):**
```bash
--allowed-tools "ReadFile,Edit,RunShell"
```

---

## Security Patterns

### Pattern 1: Sandboxed CI Agent

```bash
# In Docker container or ephemeral runner
gemini -p "Run tests, fix failures, commit" \
  --approval-mode yolo \
  --include-directories src tests
```

**Safety:** Container isolation prevents damage to host.

### Pattern 2: Safe Local Refactoring

```bash
# On local machine
gemini -p "Convert to TypeScript" \
  --approval-mode auto_edit \
  --include-directories src
```

**Safety:** Can't run arbitrary commands; git provides rollback.

### Pattern 3: Restricted Documentation Bot

```bash
gemini -p "Update all markdown files" \
  --approval-mode yolo \
  --allowed-tools "ReadFile,WriteFile" \
  --include-directories docs
```

**Safety:** Can only read/write; no code execution possible.

### Pattern 4: Analysis Only

```bash
gemini -p "Find security vulnerabilities" \
  --approval-mode auto_edit \
  --allowed-tools "ReadFile" \
  --include-directories src
```

**Safety:** Read-only; cannot modify anything.

---

## Troubleshooting

### Script Hangs Indefinitely

**Symptom:** Headless script never completes.

**Cause:** Using default approval mode; waiting for user input.

**Fix:**
```bash
# Add explicit approval mode
gemini -p "Task" --approval-mode auto_edit
```

### Permission Denied Errors

**Symptom:** Agent reports cannot access file.

**Cause:** File not in authorized scope.

**Fix:**
```bash
# Expand visibility
gemini -p "Task" --include-directories path/to/files
```

### Agent Can't Find Related Files

**Symptom:** Agent fixes one file but misses dependencies.

**Cause:** Explicit consent model limits visibility.

**Fix:**
```bash
# Include parent directory
gemini -p "Refactor auth module" --include-directories src
```

### Shell Commands Blocked in auto_edit

**Symptom:** Agent tries to run tests but gets blocked.

**Cause:** auto_edit doesn't auto-approve RunShell.

**Options:**
1. Switch to yolo (in sandbox only)
2. Run tests manually before/after agent
3. Use `--allowed-tools` to add RunShell (carefully)
