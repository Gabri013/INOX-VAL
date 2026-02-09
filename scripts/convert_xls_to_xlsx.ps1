param(
  [string]$InputPath = "data/planilha_preco.xls",
  [string]$OutputPath = "data/planilha_preco.xlsx"
)

$libreOffice = $env:LIBREOFFICE_PATH
if (-not $libreOffice) {
  $candidates = @(
    "C:/Program Files/LibreOffice/program/soffice.exe",
    "C:/Program Files (x86)/LibreOffice/program/soffice.exe"
  )
  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      $libreOffice = $candidate
      break
    }
  }
}

if (-not $libreOffice) {
  throw "LibreOffice nao encontrado. Defina LIBREOFFICE_PATH ou instale o LibreOffice."
}

$inputFull = (Resolve-Path $InputPath).Path
$outputDir = Split-Path -Parent $OutputPath
if (-not $outputDir) {
  $outputDir = "."
}
$outputDir = (Resolve-Path $outputDir).Path
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

& $libreOffice --headless --convert-to xlsx --outdir $outputDir $inputFull | Out-Null

$baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputFull)
$expected = Join-Path $outputDir ($baseName + ".xlsx")
if (-not (Test-Path $expected)) {
  throw "Falha ao gerar XLSX. Verifique se o LibreOffice concluiu a conversao."
}
$outputFileName = Split-Path -Leaf $OutputPath
$outputFull = Join-Path $outputDir $outputFileName

Copy-Item -Path $expected -Destination $outputFull -Force
Write-Output "XLSX gerado em: $outputFull"
