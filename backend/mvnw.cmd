@echo off
setlocal
set "MVN_VERSION=3.9.6"
set "MVN_DIR=%~dp0.mvn\apache-maven-%MVN_VERSION%"
set "MVN_ZIP=%~dp0.mvn\maven.zip"

if not exist "%MVN_DIR%\bin\mvn.cmd" (
    echo Downloading Maven %MVN_VERSION%...
    if not exist "%~dp0.mvn" mkdir "%~dp0.mvn"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/%MVN_VERSION%/binaries/apache-maven-%MVN_VERSION%-bin.zip' -OutFile '%MVN_ZIP%'"
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path '%MVN_ZIP%' -DestinationPath '%~dp0.mvn' -Force"
    del "%MVN_ZIP%"
)

"%MVN_DIR%\bin\mvn.cmd" %*
