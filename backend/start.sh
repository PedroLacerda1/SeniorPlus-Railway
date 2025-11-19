#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname "$0")"

if [ -x ./mvnw ]; then
  MVN_CMD="./mvnw"
else
  MVN_CMD="mvn"
fi

echo "[start] Launching Spring Boot via $MVN_CMD"
exec $MVN_CMD spring-boot:run
