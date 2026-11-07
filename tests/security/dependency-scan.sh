#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

pushd "$ROOT_DIR" >/dev/null

OWASP_DC_VERSION="${OWASP_DC_VERSION:-12.1.0}"
# Use bash explicitly so CI doesn't need the mvnw executable bit set
DC_ARGS=("org.owasp:dependency-check-maven:${OWASP_DC_VERSION}:check" -DskipTests=true)
if [[ -n "${NVD_API_KEY:-}" ]]; then
	DC_ARGS+=(-Dnvd.api.key="${NVD_API_KEY}")
fi
bash ./backend/mvnw -pl backend -am "${DC_ARGS[@]}"

pushd frontend >/dev/null
set +o pipefail
npm audit --production --audit-level=high --json | node ../tests/security/filter-audit.js
AUDIT_STATUS=$?
set -o pipefail
popd >/dev/null

if [[ $AUDIT_STATUS -ne 0 ]]; then
	exit $AUDIT_STATUS
fi

popd >/dev/null
