param(
    [ValidateSet("openai", "gemini", "kimi", "claude", "deepseek", "ollama")]
    [string]$Backend = "openai",
    [string]$Model = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$graphify = Get-Command graphify -ErrorAction SilentlyContinue

if (-not $graphify) {
    $candidate = Get-ChildItem -Path (Join-Path $env:APPDATA "Python") -Filter "graphify.exe" -File -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if (-not $candidate) {
        throw "Graphify no está instalado. Ejecuta: python -m pip install -r requirements.txt"
    }
    $graphifyCommand = $candidate.FullName
} else {
    $graphifyCommand = $graphify.Source
}

$arguments = @("extract", $projectRoot, "--backend", $Backend, "--out", $projectRoot)
if ($Model) {
    $arguments += @("--model", $Model)
}

& $graphifyCommand @arguments
if ($LASTEXITCODE -ne 0) {
    throw "Graphify no pudo construir el grafo. Comprueba la credencial o el backend seleccionado."
}

$graphPath = Join-Path $projectRoot "graphify-out\graph.json"
$htmlPath = Join-Path $projectRoot "graphify-out\GRAPH_TREE.html"
& $graphifyCommand tree --graph $graphPath --output $htmlPath --root $projectRoot --label "Automatización LinkedIn n8n"
if ($LASTEXITCODE -ne 0) {
    throw "El grafo se generó, pero no fue posible crear el mapa HTML."
}

Write-Host "Mapa generado en $htmlPath"
