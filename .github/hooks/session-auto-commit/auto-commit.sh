#!/bin/bash

# Session Auto-Commit Hook
# Automatically commits and pushes changes when a Copilot session ends

set -euo pipefail

# Check if SKIP_AUTO_COMMIT is set
if [[ "${SKIP_AUTO_COMMIT:-}" == "true" ]]; then
  echo "⏭️  Auto-commit skipped (SKIP_AUTO_COMMIT=true)"
  exit 0
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "⚠️  Not in a git repository"
  exit 0
fi

# Check for uncommitted changes
if [[ -z "$(git status --porcelain)" ]]; then
  echo "✨ No changes to commit"
  exit 0
fi

echo "📦 Auto-committing changes from Copilot session..."

# Stage all changes
git add -A

# Create commit with commitlint-compatible message
TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S')
git commit -m "chore: auto-commit session changes ($TIMESTAMP)" || {
  echo "⚠️  Commit failed (pre-commit hooks may have rejected changes)"
  exit 0
}

# Attempt to push with one retry
# Bound each push: fail fast if transfer stalls below 1KB/s for 10s
export GIT_HTTP_LOW_SPEED_LIMIT=1000
export GIT_HTTP_LOW_SPEED_TIME=10

push_with_retry() {
  if git push; then
    echo "✅ Changes committed and pushed successfully"
    return 0
  fi

  echo "⚠️  First push attempt failed, retrying in 3s..."
  sleep 3

  if git push; then
    echo "✅ Changes committed and pushed on retry"
    return 0
  fi

  echo "❌ Push failed after 2 attempts - changes committed locally only"
  echo "   Run 'git push' manually to sync"
  return 0
}

push_with_retry

exit 0
