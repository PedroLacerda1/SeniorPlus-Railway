#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname "$0")"

find_jar_path() {
  local candidate
  for candidate in "../target/seniorplus-0.0.1-SNAPSHOT.jar" "target/seniorplus-0.0.1-SNAPSHOT.jar"; do
    if [ -f "$candidate" ]; then
      local dir base
      dir=$(cd "$(dirname "$candidate")" && pwd)
      base=$(basename "$candidate")
      printf '%s/%s' "$dir" "$base"
      return 0
    fi
  done
  return 1
}

if JAR_PATH=$(find_jar_path); then
  echo "[start] Launching Spring Boot via java -jar"
  exec java -jar "$JAR_PATH"
fi

if [ -x ./mvnw ]; then
  MVN_CMD="./mvnw"
else
  MVN_CMD="mvn"
fi

echo "[start] Launching Spring Boot via $MVN_CMD"
exec $MVN_CMD spring-boot:run
