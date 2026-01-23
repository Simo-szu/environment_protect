@echo off
setlocal enabledelayedexpansion

set BASEDIR=%~dp0\..\..
set WRAPPER_DIR=%BASEDIR%\.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

if not exist "%WRAPPER_JAR%" (
  echo Maven wrapper JAR not found: %WRAPPER_JAR%
  echo Please re-run repository setup; wrapper JAR should be committed.
  exit /b 1
)

set MAVEN_OPTS=%MAVEN_OPTS%

for /f "usebackq tokens=1* delims==" %%A in ("%WRAPPER_PROPERTIES%") do (
  if /I "%%A"=="distributionUrl" set DISTRIBUTION_URL=%%B
)

if "%DISTRIBUTION_URL%"=="" (
  echo distributionUrl not set in %WRAPPER_PROPERTIES%
  exit /b 1
)

set "MVNW_REPO=%USERPROFILE%\.m2\wrapper\dists"
if not exist "%MVNW_REPO%" mkdir "%MVNW_REPO%" >nul 2>&1

rem Let the wrapper JAR handle downloading/extracting Maven and running it.
java -cp "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%BASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
