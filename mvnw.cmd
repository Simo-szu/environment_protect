@echo off
setlocal
set BASEDIR=%~dp0
call "%BASEDIR%\.mvn\wrapper\maven-wrapper.cmd" %*
