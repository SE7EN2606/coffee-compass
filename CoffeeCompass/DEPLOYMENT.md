# Deploying CoffeeCompass to Netlify

This guide explains how to deploy the CoffeeCompass application to Netlify.

## Prerequisites

1. A Netlify account - Sign up at [netlify.com](https://netlify.com) if you don't have one
2. Git repository with your CoffeeCompass code
3. Required environment variables (see below)

## Environment Variables

The following environment variables should be set in Netlify's deploy settings:

- `DATABASE_URL`: PostgreSQL connection string for your database
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key for location services

## Deployment Steps

### Option 1: Deploy through Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the CoffeeCompass repository
5. Configure the build settings:
   - Team: `coffee-shop-bible`
   - Site name: `coffee-compass`
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Show advanced" and add the required environment variables
7. Click "Deploy site"

### Option 2: Deploy using Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Navigate to your project directory
4. Initialize Netlify: `netlify init`
   - Choose "Create & configure a new site"
   - Team: `coffee-shop-bible`
   - Site name: `coffee-compass`
5. Deploy the site: `netlify deploy --prod`

## Post-Deployment

After deployment, your site will be available at:
- https://coffee-compass.netlify.app

## Troubleshooting

If you encounter issues:

1. Check build logs in the Netlify dashboard
2. Verify that all environment variables are correctly set
3. Make sure the database is accessible from Netlify's servers

## Serverless Functions

For the backend API to work properly on Netlify, you'll need to:

1. Create Netlify functions in the `netlify/functions` directory
2. Update the API paths in the frontend to use `/.netlify/functions/api` instead of `/api`

Refer to the `netlify.toml` file for configuration details.