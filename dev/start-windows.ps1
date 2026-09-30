# Starts Taskly locally on Windows: Kestrel backend + Vite frontend.
# Backend : https://localhost:1998 (dotnet run, 'https' launch profile)
# Frontend: http://localhost:2026  (vite dev server, proxies /api etc. to :1998)

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$solutionRoot = Split-Path -Parent $scriptDirectory

$backendPath = Join-Path $solutionRoot 'src\Taskly.Web'
$frontendPath = Join-Path $solutionRoot 'src\Taskly.Web\ClientApp'

$backendCommand = "dotnet run --project '$backendPath' --launch-profile https"
$frontendCommand = "npm run dev"

$wt = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wt) {
    # Windows Terminal: backend on the left, Vite on the right.
    wt.exe -p Powershell -d "$backendPath" --title "Taskly Backend (Kestrel)" --suppressApplicationTitle pwsh -NoExit -Command $backendCommand `; `
        split-pane -V -p Powershell -d "$frontendPath" --title "Taskly Frontend (Vite)" --suppressApplicationTitle pwsh -NoExit -Command $frontendCommand
}
else {
    # Fallback: two separate PowerShell windows.
    Start-Process pwsh -ArgumentList '-NoExit', '-Command', "Set-Location '$backendPath'; $backendCommand"
    Start-Process pwsh -ArgumentList '-NoExit', '-Command', "Set-Location '$frontendPath'; $frontendCommand"
}

Start-Sleep 25
Start-Process "http://localhost:2026"
