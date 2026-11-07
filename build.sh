#!/usr/bin/env bash
set -euo pipefail

echo "Starting build process..."

# Detect whether the repository root already is the backend module or contains
# the module as a subdirectory.
if [ -d backend ] && [ -f backend/pom.xml ]; then
	BUILD_ROOT="backend"
else
	BUILD_ROOT="."
fi

pushd "$BUILD_ROOT" >/dev/null

if [ -x mvnw ]; then
	MVN_CMD="./mvnw"
else
	MVN_CMD="mvn"
fi

$MVN_CMD clean install -DskipTests
popd >/dev/null

echo "Build completed"

SOURCE_TARGET="$BUILD_ROOT/target"
echo "Contents of $SOURCE_TARGET:"
ls -la "$SOURCE_TARGET"/

echo "Moving JAR to expected location..."
mkdir -p target
if [ "$BUILD_ROOT" = "." ]; then
	echo "Artifacts already under target/, skipping copy"
else
	cp "$SOURCE_TARGET"/*.jar target/ 2>/dev/null || echo "No JAR found in $SOURCE_TARGET"
fi
ls -la target/
echo "Build script finished"