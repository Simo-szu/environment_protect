#!/bin/sh
set -e

BASEDIR="$(cd "$(dirname "$0")/../.." && pwd)"
WRAPPER_DIR="$BASEDIR/.mvn/wrapper"
WRAPPER_JAR="$WRAPPER_DIR/maven-wrapper.jar"
WRAPPER_PROPERTIES="$WRAPPER_DIR/maven-wrapper.properties"

if [ ! -f "$WRAPPER_JAR" ]; then
  echo "Maven wrapper JAR not found: $WRAPPER_JAR" >&2
  echo "Please re-run repository setup; wrapper JAR should be committed." >&2
  exit 1
fi

exec java -cp "$WRAPPER_JAR" -Dmaven.multiModuleProjectDirectory="$BASEDIR" org.apache.maven.wrapper.MavenWrapperMain "$@"
