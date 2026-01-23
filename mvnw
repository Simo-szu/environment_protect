#!/bin/sh
# Maven Wrapper script (minimal)
set -e
BASEDIR="$(cd "$(dirname "$0")" && pwd)"
exec "$BASEDIR/.mvn/wrapper/maven-wrapper.sh" "$@"
