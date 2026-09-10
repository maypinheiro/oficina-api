param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [int]$Requests = 30
)

$headers = @{ Authorization = "Bearer $Token"; "X-Correlation-Id" = "demo-fase3" }

1..$Requests | ForEach-Object {
  Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get | Out-Null
  Invoke-RestMethod -Uri "$BaseUrl/metricas/tempo-medio" -Method Get -Headers $headers | Out-Null
  try { Invoke-RestMethod -Uri "$BaseUrl/rota-demo-inexistente" -Method Get | Out-Null } catch { }
}

Write-Host "Dados de demonstracao enviados. Aguarde a janela de agregacao do Datadog."
