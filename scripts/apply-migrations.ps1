$ErrorActionPreference = "Stop"

$databaseUrl = $env:DATABASE_URL

if (-not $databaseUrl) {
  $envFile = Join-Path $PSScriptRoot "..\.env"
  $databaseUrlLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
  $databaseUrl = $databaseUrlLine -replace "^DATABASE_URL=", ""
}

if ($databaseUrl -notmatch "postgresql://([^:]+):([^@]+)@([^:/]+):(\d+)/(.+)$") {
  throw "DATABASE_URL invalida para aplicar SQL direto."
}

$user = $Matches[1]
$password = $Matches[2]
$hostName = $Matches[3]
$port = $Matches[4]
$database = $Matches[5]

$container = "techchallenge-oficina-postgres"
$migrationsPath = Join-Path $PSScriptRoot "..\prisma\migrations"

$env:PGPASSWORD = $password

docker exec $container psql -v ON_ERROR_STOP=1 -U $user -d $database -c "CREATE TABLE IF NOT EXISTS ""_manual_migrations"" (name TEXT PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);" | Out-Null

$initialSchemaExists = [string](docker exec $container psql -v ON_ERROR_STOP=1 -U $user -d $database -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Cliente');")

if ($initialSchemaExists.Trim() -eq "t") {
  docker exec $container psql -v ON_ERROR_STOP=1 -U $user -d $database -c "INSERT INTO ""_manual_migrations"" (name) VALUES ('20260502143000_initial_schema') ON CONFLICT (name) DO NOTHING;" | Out-Null
}

$migrationDirectories = Get-ChildItem -LiteralPath $migrationsPath -Directory | Sort-Object Name

foreach ($migrationDirectory in $migrationDirectories) {
  $migrationName = $migrationDirectory.Name
  $migration = Join-Path $migrationDirectory.FullName "migration.sql"

  if (Test-Path -LiteralPath $migration) {
    $alreadyApplied = [string](docker exec $container psql -v ON_ERROR_STOP=1 -U $user -d $database -tAc "SELECT 1 FROM ""_manual_migrations"" WHERE name = '$migrationName';")
    if ($null -eq $alreadyApplied) {
      $alreadyApplied = ""
    }

    if ($alreadyApplied.Trim() -eq "1") {
      Write-Host "Skipping $migrationName"
    } else {
      Write-Host "Applying $migrationName"
      Get-Content -Raw -LiteralPath $migration |
        docker exec -i $container psql -v ON_ERROR_STOP=1 -U $user -d $database
      docker exec $container psql -v ON_ERROR_STOP=1 -U $user -d $database -c "INSERT INTO ""_manual_migrations"" (name) VALUES ('$migrationName') ON CONFLICT (name) DO NOTHING;" | Out-Null
    }
  }
}

Write-Host "Migrations applied to $database at ${hostName}:$port."
