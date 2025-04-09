#!/bin/bash
# Script to prepare CoffeeCompass for Netlify deployment

echo "===== CoffeeCompass Netlify Deployment Preparation ====="
echo "This script will prepare your project for Netlify deployment"

# Step 1: Clean previous build files
echo "Step 1: Cleaning previous build files..."
rm -rf dist
rm -f deployment.zip

# Step 2: Build the project
echo "Step 2: Building the project..."
cd client
echo "  - Building client-side application..."
npm run build
cd ..

# Step 3: Create necessary directories
echo "Step 3: Creating deployment structure..."
mkdir -p dist/public

# Step 4: Create zip file for Netlify direct upload
echo "Step 4: Creating deployment package..."
zip -r deployment.zip dist netlify netlify.toml package.json

echo "===== Deployment Preparation Complete ====="
echo ""
echo "Your deployment.zip file is ready!"
echo ""
echo "TO DEPLOY:"
echo "1. Log in to your Netlify account"
echo "2. Click 'Add new site' → 'Deploy manually'"
echo "3. Drag and drop the deployment.zip file"
echo "4. Configure environment variables:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - GOOGLE_MAPS_API_KEY: Your Google Maps API key"
echo ""
echo "Don't forget to set the Publish directory to 'dist/public' in the site settings!"