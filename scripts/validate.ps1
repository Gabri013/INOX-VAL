$ErrorActionPreference = 'Stop'

Write-Host "[validate] npm ci"
npm ci

Write-Host "[validate] npm run typecheck"
npm run typecheck

Write-Host "[validate] npm run build"
npm run build

