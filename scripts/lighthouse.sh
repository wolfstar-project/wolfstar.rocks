#!/bin/bash
# Run Lighthouse CI audits.
#
# Modes:
#   - Accessibility (default): requires LIGHTHOUSE_COLOR_MODE (dark/light)
#   - Performance: set LH_PERF=1 (no color mode needed)
#
# The LIGHTHOUSE_COLOR_MODE env var is read by lighthouse-setup.cjs
# to set the appropriate theme before each audit.

set -e

if [ -n "${LH_PERF}" ]; then
  echo "⚡ Running Lighthouse performance audit (CLS)..."
  pnpm dlx @lhci/cli autorun --upload.githubStatusContextSuffix="/perf"
  echo ""
  echo "✅ Performance audit completed"
  exit 0
fi

case "${LIGHTHOUSE_COLOR_MODE}" in
  dark)
    echo "🌙 Running Lighthouse accessibility audit (dark mode)..."
    pnpm dlx @lhci/cli autorun --upload.githubStatusContextSuffix="/dark"
    ;;
  light)
    echo "☀️ Running Lighthouse accessibility audit (light mode)..."
    pnpm dlx @lhci/cli autorun --upload.githubStatusContextSuffix="/light"
    ;;
  *)
    echo "⚠️ Missing or invalid LIGHTHOUSE_COLOR_MODE. Use 'dark' or 'light'."
    exit 1
    ;;
esac

echo ""
echo "✅ Accessibility audit completed"
