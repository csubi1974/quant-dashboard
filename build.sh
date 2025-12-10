#!/bin/bash

echo "🔧 Building Tradier Dashboard for Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api
npm install
cd ..

echo "✅ Build completed successfully!"