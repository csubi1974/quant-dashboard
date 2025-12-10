@echo off
echo 🔧 Building Tradier Dashboard for Vercel...

# Check if TRADIER_API_KEY is set
if "%TRADIER_API_KEY%"=="" (
  echo ❌ Error: TRADIER_API_KEY is not set
  exit /b 1
)

echo ✅ Environment variables configured
echo 🔧 Building application...

# Install dependencies
call npm ci
if errorlevel 1 (
  echo ❌ Failed to install dependencies
  exit /b 1
)

# Build frontend
call npm run build
if errorlevel 1 (
  echo ❌ Failed to build frontend
  exit /b 1
)

# Install API dependencies
cd api
call npm ci
if errorlevel 1 (
  echo ❌ Failed to install API dependencies
  exit /b 1
)
cd ..

echo ✅ Build completed successfully!