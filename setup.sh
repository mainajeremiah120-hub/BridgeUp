#!/bin/bash
# Exit on error
set -e

echo "===================================================="
echo "🚀 Starting BridgeUp MVP Local Setup Script"
echo "===================================================="

# 1. Install workspace dependencies
echo "📦 Installing npm dependencies across workspaces..."
npm install

# 2. Build the shared packages
echo "🛠️ Building @bridgeup/types package..."
npm run build -w @bridgeup/types

# 3. Setup database & Prisma
echo "🗄️ Creating local SQLite database and running seeds..."
cd apps/api
npx prisma db push
npx prisma db seed
cd ../..

echo "===================================================="
echo "✅ Setup complete! All red lines in your editor should be gone."
echo "👉 Start the frontend and backend servers with: npm run dev"
echo "===================================================="
