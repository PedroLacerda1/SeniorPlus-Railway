#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

pushd "$ROOT_DIR" >/dev/null

mvn -pl backend -am org.owasp:dependency-check-maven:check -DskipTests=true

pushd frontend >/dev/null
npm audit --production --audit-level=high --json | node ../tests/security/filter-audit.js
popd >/dev/null

popd >/dev/null
