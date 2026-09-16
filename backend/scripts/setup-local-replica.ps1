# =========================================================================
# MongoDB Local Replica Set Setup Script (Windows PowerShell)
# =========================================================================

$dataDir = "$PSScriptRoot\..\.mongo_data"
$logFile = "$PSScriptRoot\..\mongod_rs0.log"

Write-Host "Creating data directory for Replica Set at $dataDir..." -ForegroundColor Cyan
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
}

Write-Host "Stopping any existing mongod processes on port 27018..." -ForegroundColor Cyan
Get-Process mongod -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "27018" -or $_.CommandLine -match "27018" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Starting mongod with --replSet rs0 on port 27018..." -ForegroundColor Cyan
# Redirect output to log file to capture errors
$process = Start-Process "mongod" -ArgumentList "--dbpath `"$dataDir`" --replSet rs0 --port 27018 --logpath `"$logFile`"" -NoNewWindow -PassThru

# Wait for mongod to initialize
Start-Sleep -Seconds 5

if ($process.HasExited) {
    Write-Host "mongod exited prematurely with code $($process.ExitCode). Check $logFile for details." -ForegroundColor Red
    Get-Content $logFile -Tail 20
    exit 1
}

Write-Host "Initializing Replica Set..." -ForegroundColor Cyan
# Execute rs.initiate() using mongosh
$initScript = "rs.initiate({_id: 'rs0', members: [{_id: 0, host: '127.0.0.1:27018'}]})"
mongosh --port 27018 --eval $initScript

Write-Host "Waiting for Replica Set to become PRIMARY..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Verification: Replica Set Status" -ForegroundColor Cyan
mongosh --port 27018 --eval "rs.status()"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "SUCCESS: MongoDB Replica Set 'rs0' is now running locally on port 27018." -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
