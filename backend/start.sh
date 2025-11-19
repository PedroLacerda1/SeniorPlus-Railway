#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname "$0")" && pwd)
ROOT_SCRIPT="$SCRIPT_DIR/../start.sh"

if [ ! -f "$ROOT_SCRIPT" ]; then
  echo "ERROR: Parent start.sh not found at $ROOT_SCRIPT" >&2
  exit 1
fi

chmod +x "$ROOT_SCRIPT"
exec "$ROOT_SCRIPT"
