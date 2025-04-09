// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { eq } = require('drizzle-orm');
const schema = require('./schema');
const { db, pool } = require('./db');
const { asyncHandler, createResponse, logError } = require('./utils');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/.netlify/functions/api/coffee-shops', async (req, res) => {
  try {
    const shops = await db.select().from(schema.coffeeShops);
    res.json(shops);
  } catch (error) {
    console.error('Error fetching coffee shops:', error);
    res.status(500).json({ error: 'Failed to fetch coffee shops' });
  }
});

app.get('/.netlify/functions/api/coffee-shops/:id', async (req, res) => {
  try {
    const [shop] = await db.select().from(schema.coffeeShops).where(eq(schema.coffeeShops.id, Number(req.params.id)));
    if (!shop) return res.status(404).json({ error: 'Coffee shop not found' });
    res.json(shop);
  } catch (error) {
    console.error('Error fetching coffee shop:', error);
    res.status(500).json({ error: 'Failed to fetch coffee shop' });
  }
});

app.post('/.netlify/functions/api/coffee-shops', async (req, res) => {
  try {
    const [shop] = await db.insert(schema.coffeeShops).values({
      ...req.body,
      userId: 1 // Default user ID for now
    }).returning();
    res.status(201).json(shop);
  } catch (error) {
    console.error('Error creating coffee shop:', error);
    res.status(500).json({ error: 'Failed to create coffee shop' });
  }
});

app.get('/.netlify/functions/api/coffee-shops/:id/ratings', async (req, res) => {
  try {
    const ratings = await db.select().from(schema.ratings).where(eq(schema.ratings.shopId, Number(req.params.id)));
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.post('/.netlify/functions/api/coffee-shops/:id/ratings', async (req, res) => {
  try {
    const [rating] = await db.insert(schema.ratings).values({
      ...req.body,
      shopId: Number(req.params.id),
      userId: 1 // Default user ID for now
    }).returning();
    res.status(201).json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// Google Places API proxy routes
app.get('/.netlify/functions/api/places/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const suggestions = data.predictions.map(prediction => ({
      description: prediction.description,
      placeId: prediction.place_id,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

app.get('/.netlify/functions/api/places/details', async (req, res) => {
  const placeId = req.query.placeId;
  if (!placeId) {
    return res.status(400).json({ error: 'Place ID parameter is required' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,website,formatted_phone_number,url,opening_hours&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ error: data.error_message || 'Place not found' });
    }

    res.json(data.result);
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Regular endpoints for compatibility
app.get('/api/coffee-shops', (req, res) => {
  return app._router.handle(req, { ...res, url: '/.netlify/functions/api/coffee-shops' });
});

app.get('/api/coffee-shops/:id', (req, res) => {
  return app._router.handle(req, { ...res, url: `/.netlify/functions/api/coffee-shops/${req.params.id}` });
});

app.post('/api/coffee-shops', (req, res) => {
  return app._router.handle(req, { ...res, url: '/.netlify/functions/api/coffee-shops' });
});

app.get('/api/coffee-shops/:id/ratings', (req, res) => {
  return app._router.handle(req, { ...res, url: `/.netlify/functions/api/coffee-shops/${req.params.id}/ratings` });
});

app.post('/api/coffee-shops/:id/ratings', (req, res) => {
  return app._router.handle(req, { ...res, url: `/.netlify/functions/api/coffee-shops/${req.params.id}/ratings` });
});

app.get('/api/places/search', (req, res) => {
  return app._router.handle(req, { ...res, url: '/.netlify/functions/api/places/search' });
});

app.get('/api/places/details', (req, res) => {
  return app._router.handle(req, { ...res, url: '/.netlify/functions/api/places/details' });
});

// Add a root route for health checks
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CoffeeCompass API is up and running' });
});

// Add a simple catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Serverless handler
exports.handler = serverless(app);