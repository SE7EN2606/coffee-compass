# Netlify Deployment Guide for CoffeeCompass

This document provides a step-by-step guide for deploying the CoffeeCompass application to Netlify.

## Prerequisites

1. A [Netlify](https://www.netlify.com/) account
2. Access to a PostgreSQL database (e.g., Supabase, Neon, ElephantSQL, etc.)
3. A Google Maps API key

## Option 1: Direct Upload (Recommended)

1. Run this command to create a deployment-ready zip file:
   ```
   npm run netlify:build && zip -r deployment.zip dist netlify netlify.toml package.json
   ```

2. Log in to your Netlify account
3. Click "Add new site" → "Deploy manually"
4. Drag and drop the `deployment.zip` file
5. After uploading, go to "Site settings" → "Environment variables" and add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Option 2: Git Integration

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to your Netlify account
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select the CoffeeCompass repository
5. Configure the build settings:
   - **Build command**: `npm run netlify:build`
   - **Publish directory**: `dist/public`
6. Click "Show advanced" and add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
7. Click "Deploy site"

## Critical Configuration Settings

- **Publish directory**: Must be set to `dist/public` (not just `dist`)
- **Build command**: Must use `npm run netlify:build` which is configured correctly
- **Environment variables**: Both DATABASE_URL and GOOGLE_MAPS_API_KEY are required

## Verifying Deployment Success

1. After deployment completes, visit your Netlify URL
2. You should see the CoffeeCompass application home page
3. The app should be able to:
   - Load the map
   - Display coffee shops
   - Allow adding new shops
   - Show details of specific shops

## Troubleshooting 404 Errors

If you see a "Page not found" error:

1. Go to Site settings → Continuous Deployment → Build settings
2. Ensure publish directory is set to `dist/public`
3. Add a _redirects file (if it's not being picked up from the repo):
   - Go to Site settings → Domain management → Custom domains → Deploy settings
   - Add a redirect rule: `/* /index.html 200`
4. Trigger a new deployment

## Database Connection Issues

If the app deploys but can't connect to the database:

1. Verify DATABASE_URL is correct in Environment variables
2. Check function logs in Functions → api → Recent invocations
3. Ensure your database allows connections from Netlify IPs

## Local Testing Before Deployment

To test locally before deploying:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create a `.env` file with DATABASE_URL and GOOGLE_MAPS_API_KEY
3. Run: `netlify dev`

## Important Notes

- Client-side routing is handled by the _redirects file and netlify.toml configuration
- API calls are proxied to Netlify Functions via the redirects configuration
- The build process is configured to output files to the correct location
- Environment variables must be added in Netlify's dashboard, not in the code repository