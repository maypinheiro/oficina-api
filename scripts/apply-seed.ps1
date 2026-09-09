$ErrorActionPreference = "Stop"

$databaseUrl = $env:DATABASE_URL

if (-not $databaseUrl) {
  $envFile = Join-Path $PSScriptRoot "..\.env"
  $databaseUrlLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
  $databaseUrl = $databaseUrlLine -replace "^DATABASE_URL=", ""
}

if ($databaseUrl -notmatch "postgresql://([^:]+):([^@]+)@([^:/]+):(\d+)/(.+)$") {
  throw "DATABASE_URL invalida para aplicar seed SQL."
}

$user = $Matches[1]
$database = $Matches[5]
$container = "techchallenge-oficina-postgres"
$seed = Join-Path $PSScriptRoot "seed.sql"

Get-Content -Raw -LiteralPath $seed |
  docker exec -i $container psql -v ON_ERROR_STOP=1 -U $user -d $database

Write-Host "Seed aplicado em $database."
