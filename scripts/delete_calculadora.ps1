# Script PowerShell para remover toda a pasta calculadora do domínio
Remove-Item -Recurse -Force src/domains/calculadora
Remove-Item -Force src/app/pages/Calculadora.tsx
