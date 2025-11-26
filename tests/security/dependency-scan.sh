#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

pushd "$ROOT_DIR" >/dev/null

OWASP_DC_VERSION="${OWASP_DC_VERSION:-11.1.1}"
./backend/mvnw -pl backend -am "org.owasp:dependency-check-maven:${OWASP_DC_VERSION}:check" -DskipTests=true

pushd frontend >/dev/null
npm audit --production --audit-level=high --json | node ../tests/security/filter-audit.js
popd >/dev/null

popd >/dev/null
