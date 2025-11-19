#!/usr/bin/env bash
set -euo pipefail

# Locate the Spring Boot module regardless of whether the workspace root is the
# repository root or the backend directory itself.
if [ -d backend ] && [ -f backend/pom.xml ]; then
    APP_ROOT="backend"
elif [ -f pom.xml ]; then
    APP_ROOT="."
else
    echo "ERROR: Unable to find backend module (missing pom.xml)" >&2
    exit 1
fi

pushd "$APP_ROOT" >/dev/null

if [ -x mvnw ]; then
    MVN_CMD="./mvnw"
else
    MVN_CMD="mvn"
fi

echo "Starting Spring Boot application from $(pwd)"
exec $MVN_CMD spring-boot:run