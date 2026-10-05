# AEGIS Mine Rescue 3D Digital Twin MVP Launcher Script
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  AEGIS MINE RESCUE - SIH 2026 3D DIGITAL TWIN MVP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Yellow

# Install Python requirements
Write-Host "[1/3] Installing Python dependencies..." -ForegroundColor Green
python -m pip install -r backend/requirements.txt

# Install Node dependencies
Write-Host "[2/3] Installing Node.js dependencies..." -ForegroundColor Green
Set-Location frontend
npm install
Set-Location ..

# Launch FastAPI & Next.js
Write-Host "[3/3] Starting Backend & Frontend Servers..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command Set-Location backend; python -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit -Command Set-Location frontend; npm run dev"

Write-Host ""
Write-Host "System Launching!" -ForegroundColor Yellow
Write-Host "FastAPI Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Next.js Dashboard: http://localhost:3000" -ForegroundColor Cyan
