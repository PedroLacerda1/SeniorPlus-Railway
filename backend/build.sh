#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname "$0")"

if [ -x ./mvnw ]; then
  MVN_CMD="./mvnw"
else
  MVN_CMD="mvn"
fi

echo "[build] Cleaning and packaging backend with $MVN_CMD"
$MVN_CMD clean install -DskipTests

echo "[build] Contents of target/"
ls -la target/

# Railway expects build artifacts under /app/target, so copy them up one level
ROOT_TARGET_DIR="$(cd .. && pwd)/target"
mkdir -p "$ROOT_TARGET_DIR"
cp target/*.jar "$ROOT_TARGET_DIR"/ 2>/dev/null || echo "[build] Nenhum JAR encontrado para copiar"
