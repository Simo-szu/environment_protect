param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("social-api")]
  [string]$Service = "social-api",

  [Parameter(Mandatory = $false)]
  [string]$OutDir = "packages/api-contracts/openapi",

  [Parameter(Mandatory = $false)]
  [int]$Port = 8080,

  [Parameter(Mandatory = $false)]
  [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:$Port"
$healthUrl = "$baseUrl/health"
$openApiJsonUrl = "$baseUrl/v3/api-docs"
$openApiYamlUrl = "$baseUrl/v3/api-docs.yaml"

function Get-CommandOrThrow {
  param([Parameter(Mandatory = $true)][string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Required command not found: $Name" }
  return $cmd
}

function Get-HttpStatusCode {
  param([Parameter(Mandatory = $true)][string]$Url)
  $code = & curl.exe -sS -o NUL -w "%{http_code}" $Url
  [int]$code
}

Get-CommandOrThrow -Name "curl.exe" | Out-Null

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$outJsonPath = Join-Path $OutDir "$Service.json"
$outYamlPath = Join-Path $OutDir "$Service.yaml"

Write-Host "Exporting OpenAPI from running service: $baseUrl"

$deadline = (Get-Date).AddSeconds($TimeoutSec)
while ((Get-Date) -lt $deadline) {
  try {
    if ((Get-HttpStatusCode -Url $healthUrl) -eq 200) { break }
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

try {
  if ((Get-HttpStatusCode -Url $healthUrl) -ne 200) {
    throw "Health endpoint not OK: $healthUrl"
  }
} catch {
  throw "Service is not reachable. Start the API first, then retry. Expected: $healthUrl"
}

# 直接用 curl 保存响应字节，避免 PowerShell 解码/交互提示问题导致导出失败或“乱码”
& curl.exe -sS --fail -H "Accept: application/json" -o $outJsonPath $openApiJsonUrl | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Failed to download OpenAPI JSON from: $openApiJsonUrl"
}

if ((Get-HttpStatusCode -Url $openApiYamlUrl) -eq 200) {
  & curl.exe -sS --fail -H "Accept: application/yaml, application/x-yaml, text/yaml, text/plain" -o $outYamlPath $openApiYamlUrl 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Remove-Item -Force -ErrorAction SilentlyContinue $outYamlPath
  }
}

Write-Host "Export completed:"
Write-Host " - $outJsonPath"
if (Test-Path $outYamlPath) {
  Write-Host " - $outYamlPath"
} else {
  Write-Host " - YAML not generated (endpoint not available): $openApiYamlUrl"
}
