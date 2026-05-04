# MCP Integration Reference

> **Load when:** User asks about external services, GitHub/Postgres/Slack integration, or MCP servers.

Extend Gemini CLI to external services via Model Context Protocol.

## Contents

- [MCP Overview](#mcp-overview)
- [Configuration](#configuration)
- [Common Servers](#common-servers)
- [Hybrid Agent Patterns](#hybrid-agent-patterns)
- [Troubleshooting](#troubleshooting)

---

## MCP Overview

Model Context Protocol (MCP) allows Gemini CLI to interact with external services beyond the local filesystem.

### How It Works

1. MCP servers defined in settings.json
2. CLI launches servers as subprocesses on startup
3. Servers expose tools and resources
4. Tools injected into agent's available capabilities

---

## Configuration

### settings.json Structure

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "API_KEY": "value"
      }
    }
  }
}
```

### Configuration Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `command` | Yes | Executable to launch |
| `args` | Yes | Command arguments |
| `env` | No | Environment variables |

---

## Common Servers

### GitHub MCP

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Capabilities:** Read issues/PRs, create issues, open pull requests

### PostgreSQL MCP

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/dbname"
      ]
    }
  }
}
```

**Capabilities:** Query database, read schema, execute SQL

### Slack MCP

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_TOKEN": "${SLACK_TOKEN}"
      }
    }
  }
}
```

**Capabilities:** Read channels, post messages, search history

---

## Hybrid Agent Patterns

### Pattern 1: Bug Fix Agent

```json
{
  "useSmartEdit": true,
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

```bash
gemini -p "Read GitHub issue #42, fix the bug, open a PR" \
  --approval-mode auto_edit \
  --include-directories src
```

**Workflow:**
1. Agent reads issue via GitHub MCP
2. Locates relevant code via ReadFile
3. Patches code via Edit
4. Opens PR via GitHub MCP

### Pattern 2: Data-Aware Refactoring

```bash
gemini -p "Refactor user queries to match new schema" \
  --approval-mode auto_edit \
  --include-directories src/db
```

Agent queries schema via Postgres MCP before modifying code.

### Pattern 3: Deploy Notifier

```bash
git log -1 --oneline | gemini -p "Post deployment summary to #releases" \
  --approval-mode yolo
```

---

## Environment Variable Injection

Use shell variables in settings.json:

```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Security:** Never hardcode tokens in settings.json.

---

## Troubleshooting

### MCP Server Not Starting

**Check:** Server command is valid.

```bash
npx -y @modelcontextprotocol/server-github
```

### Authentication Failures

**Check:** Environment variables set correctly.

```bash
echo $GITHUB_TOKEN
```

### Tools Not Appearing

**Check:** settings.json syntax is valid.

```bash
cat .gemini/settings.json | jq .
```

---

## Security Considerations

### Token Scope

Grant minimum permissions:

| Service | Recommended Scope |
|---------|-------------------|
| GitHub | `repo` for private, `public_repo` for public only |
| Slack | Specific channels, not workspace-wide |
| Database | Read-only user when possible |

### Sandbox MCP Access

In yolo mode, MCP servers inherit full permissions.

**Risk:** Agent could delete repos, drop tables, post to any channel.

**Mitigation:** Use read-only tokens where possible.
