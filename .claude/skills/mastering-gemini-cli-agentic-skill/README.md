# Mastering Gemini CLI Skill

Build headless automation and agentic workflows with Google's Gemini CLI.

## Overview

This skill provides comprehensive guidance for using Google's Gemini CLI in headless and agentic scenarios. It covers:

- **Approval Modes**: Understanding default, auto_edit, and yolo modes
- **File Permission Model**: Explicit consent and visibility patterns
- **Tool Selection**: When to use Edit vs WriteFile vs RunShell
- **smartEdit Configuration**: Solving the "0 occurrences found" reliability crisis
- **GEMINI.md Context Files**: Project-specific agent instructions
- **settings.json Hierarchy**: Configuration precedence
- **MCP Server Integration**: Extending agents to external services
- **Session Persistence**: Multi-step workflows with --resume

## Quick Start

```bash
# Basic headless invocation
gemini -p "Refactor auth.js to use async/await" --approval-mode auto_edit

# Pipe input for context
git diff --staged | gemini -p "Generate semantic commit message"

# JSON output for scripts
gemini -p "List TODOs in src/" --output-format json --include-directories src
```

## When to Use This Skill

Use when:
- Building CI/CD pipelines with Gemini
- Debugging "0 occurrences found" edit failures
- Configuring --approval-mode for automation
- Creating long-running agents with --resume
- Integrating external services via Model Context Protocol

## Installing with Skilz (Universal Installer)

The recommended way to install this skill across different AI coding agents is using the **skilz** universal installer.

### Install Skilz

```bash
pip install skilz
```

This skill supports [Agent Skill Standard](https://agentskills.io/) which means it supports 14 plus coding agents including Claude Code, OpenAI Codex, Cursor and Gemini.


### Git URL Options

You can use either `-g` or `--git` with HTTPS or SSH URLs:

```bash
# HTTPS URL
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill

# SSH URL
skilz install --git git@github.com:SpillwaveSolutions/mastering-gemini-cli-agentic-skill.git
```

### Claude Code

Install to user home (available in all projects):
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill
```

Install to current project only:
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --project
```

### OpenCode

Install for [OpenCode](https://opencode.ai):
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --agent opencode
```

Project-level install:
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --project --agent opencode
```

### Gemini

Project-level install for Gemini:
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --agent gemini
```

### OpenAI Codex

Install for OpenAI Codex:
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --agent codex
```

Project-level install:
```bash
skilz install -g https://github.com/SpillwaveSolutions/mastering-gemini-cli-agentic-skill --project --agent codex
```


### Install from Skillzwave Marketplace
```bash
# Claude to user home dir ~/.claude/skills
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli

# Claude skill in project folder ./claude/skills
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli --project

# OpenCode install to user home dir ~/.config/opencode/skills
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli --agent opencode

# OpenCode project level
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli --agent opencode --project

# OpenAI Codex install to user home dir ~/.codex/skills
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli

# OpenAI Codex project level ./.codex/skills
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli --agent opencode --project

# Gemini CLI (project level) -- only works with project level
skilz install SpillwaveSolutions_mastering-gemini-cli-agentic-skill/mastering-gemini-cli --agent gemini
```

See this site [skill Listing](https://skillzwave.ai/skill/SpillwaveSolutions__mastering-gemini-cli-agentic-skill__mastering-gemini-cli__SKILL/) to see how to install this exact skill to 14+ different coding agents.


### Other Supported Agents

Skilz supports 14+ coding agents including Claude Code, OpenAI Codex, OpenCode, Cursor, Gemini CLI, GitHub Copilot CLI, Windsurf, Qwen Code, Aidr, and more.

For the full list of supported platforms, visit [SkillzWave.ai/platforms](https://skillzwave.ai/platforms/) or see the [skilz-cli GitHub repository](https://github.com/SpillwaveSolutions/skilz-cli)


<a href="https://skillzwave.ai/">Largest Agentic Marketplace for AI Agent Skills</a> and
<a href="https://spillwave.com/">SpillWave: Leaders in AI Agent Development.</a>

## Skill Contents

- **SKILL.md** - Main skill documentation
- **references/** - Detailed reference documentation
  - `flags.md` - Complete flag reference
  - `permission-model.md` - Consent model and approval modes
  - `context-hierarchy.md` - GEMINI.md and settings.json
  - `tools.md` - ReadFile, Edit, WriteFile, RunShell
  - `mcp-integration.md` - External service integration
- **assets/** - Templates and starter files
  - `GEMINI-template.md` - Starter context file
  - `settings-template.json` - Minimal config with smartEdit
  - `headless-wrapper.sh` - Shell script template
- **scripts/** - Utility scripts
  - `validate-setup.sh` - Verify configuration before deployment

## License

MIT

## Author

Richard Hightower - [SpillWave Solutions](https://spillwave.com/)
