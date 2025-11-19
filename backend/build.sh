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
