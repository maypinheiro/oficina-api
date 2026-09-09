param(
  [Parameter(Mandatory = $true)]
  [string]$Token,

  [string]$HostUrl = "http://host.docker.internal:9000"
)

$ErrorActionPreference = "Stop"

$projectDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

docker run --rm `
  -e SONAR_HOST_URL=$HostUrl `
  -e SONAR_TOKEN=$Token `
  -v "${projectDir}:/usr/src" `
  sonarsource/sonar-scanner-cli:10
