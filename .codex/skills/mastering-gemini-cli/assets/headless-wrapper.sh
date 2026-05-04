#!/usr/bin/env bash
#
# Gemini CLI Headless Wrapper
# 
# Usage: ./headless-wrapper.sh "Your prompt here"
#

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================

# Approval mode: auto_edit (safe) or yolo (sandbox only)
APPROVAL_MODE="auto_edit"

# Directories to include (space-separated)
INCLUDE_DIRS="src"

# Allowed tools (comma-separated, empty for all)
ALLOWED_TOOLS=""

# Output format: text, json, stream-json
OUTPUT_FORMAT="json"

# Resume previous session: "latest", UUID, or empty
RESUME_SESSION=""

# =============================================================================
# SCRIPT
# =============================================================================

PROMPT="${1:-}"

if [[ -z "$PROMPT" ]]; then
    echo "Usage: $0 \"Your prompt here\""
    exit 1
fi

# Build command
CMD="gemini"
CMD+=" --prompt \"$PROMPT\""
CMD+=" --approval-mode $APPROVAL_MODE"
CMD+=" --output-format $OUTPUT_FORMAT"

# Add include directories
for dir in $INCLUDE_DIRS; do
    if [[ -d "$dir" ]]; then
        CMD+=" --include-directories $dir"
    else
        echo "Warning: Directory '$dir' not found, skipping"
    fi
done

# Add allowed tools if specified
if [[ -n "$ALLOWED_TOOLS" ]]; then
    CMD+=" --allowed-tools \"$ALLOWED_TOOLS\""
fi

# Add resume if specified
if [[ -n "$RESUME_SESSION" ]]; then
    CMD+=" --resume $RESUME_SESSION"
fi

# Execute
echo "Executing: $CMD"
echo "---"
eval "$CMD"
EXIT_CODE=$?

echo "---"
echo "Exit code: $EXIT_CODE"
exit $EXIT_CODE
