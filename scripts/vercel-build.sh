# Deployment Configuration for Vercel

# Ensure API key is available in production
if [ -z "$TRADIER_API_KEY" ]; then
  echo "❌ Error: TRADIER_API_KEY is not set"
  exit 1
fi

echo "✅ Environment variables configured"
echo "🔧 Building application..."

# Install dependencies
npm ci

# Build frontend
npm run build

# Install API dependencies
cd api
npm ci
cd ..

echo "✅ Build completed successfully!"