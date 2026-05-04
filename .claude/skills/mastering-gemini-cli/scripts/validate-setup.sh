#!/usr/bin/env bash
#
# Gemini CLI Setup Validator
#
# Checks that Gemini CLI is properly configured for headless automation.
# Run before deploying agentic skills.
#
# Usage: ./validate-setup.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; ((ERRORS++)); }
warn() { echo -e "${YELLOW}!${NC} $1"; ((WARNINGS++)); }

echo "=========================================="
echo "Gemini CLI Setup Validator"
echo "=========================================="
echo ""

# Check 1: Gemini CLI installed
echo "Checking Gemini CLI installation..."
if command -v gemini &> /dev/null; then
    VERSION=$(gemini --version 2>/dev/null || echo "unknown")
    pass "Gemini CLI installed (version: $VERSION)"
else
    fail "Gemini CLI not found in PATH"
fi

# Check 2: Authentication
echo ""
echo "Checking authentication..."
if [[ -n "${GEMINI_API_KEY:-}" ]]; then
    pass "GEMINI_API_KEY environment variable set"
elif [[ -f ~/.gemini/config.json ]]; then
    pass "Config file exists (~/.gemini/config.json)"
else
    fail "No authentication found"
    echo "  Set GEMINI_API_KEY or run: gemini auth login"
fi

# Check 3: Project settings.json
echo ""
echo "Checking project configuration..."
if [[ -f .gemini/settings.json ]]; then
    pass "Project settings.json exists"
    
    if command -v jq &> /dev/null; then
        SMART_EDIT=$(jq -r '.useSmartEdit // false' .gemini/settings.json 2>/dev/null)
        if [[ "$SMART_EDIT" == "true" ]]; then
            pass "smartEdit is enabled"
        else
            warn "smartEdit is NOT enabled (recommended for headless)"
        fi
    fi
else
    warn "No project settings.json found"
    echo "  Create: mkdir -p .gemini && echo '{\"useSmartEdit\": true}' > .gemini/settings.json"
fi

# Check 4: GEMINI.md context file
echo ""
echo "Checking context configuration..."
if [[ -f GEMINI.md ]]; then
    pass "Project GEMINI.md exists"
else
    warn "No project GEMINI.md found"
fi

# Check 5: Git safety
echo ""
echo "Checking safety mechanisms..."
if command -v git &> /dev/null && git rev-parse --git-dir &> /dev/null; then
    if git diff --quiet && git diff --cached --quiet 2>/dev/null; then
        pass "Git repository clean"
    else
        warn "Git has uncommitted changes"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    echo -e "${YELLOW}Passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi
