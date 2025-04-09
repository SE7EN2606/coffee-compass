import { Express, Request, Response } from 'express';
import fetch from 'node-fetch';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// This file contains the API endpoints for interacting with Google Places API
export function registerPlacesRoutes(app: Express) {
  
  // Search places endpoint with autocomplete
  app.get('/api/places/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      if (!GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API key is not configured' });
      }
      
      // Use autocomplete API to get coffee shop suggestions
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment&keyword=cafe&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch places from Google API');
      }
      
      const data = await response.json() as {
        status: string;
        predictions: any[];
        error_message?: string;
      };
      
      if (data.status !== 'OK') {
        console.error('Google API error:', data.status, data.error_message);
        return res.status(400).json({ error: `Google API error: ${data.status}`, message: data.error_message });
      }
      
      // Return the predictions for the autocomplete
      return res.json(data.predictions);
    } catch (error) {
      console.error('Places search error:', error);
      return res.status(500).json({ error: 'Failed to search places' });
    }
  });
  
  // Get place details endpoint with enhanced fields
  app.get('/api/places/details', async (req: Request, res: Response) => {
    try {
      const { placeId } = req.query;
      
      if (!placeId || typeof placeId !== 'string') {
        return res.status(400).json({ error: 'placeId parameter is required' });
      }
      
      if (!GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API key is not configured' });
      }
      
      // Make request to Google Places API Details endpoint with more fields
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,opening_hours,formatted_phone_number,website,url,photos,rating,price_level,international_phone_number&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch place details from Google API');
      }
      
      const data = await response.json() as {
        status: string;
        result: any;
        error_message?: string;
      };
      
      if (data.status !== 'OK') {
        return res.status(400).json({ error: `Google API error: ${data.status}`, message: data.error_message });
      }
      
      // Add a proper photo URL if available
      if (data.result.photos && data.result.photos.length > 0) {
        const photoReference = data.result.photos[0].photo_reference;
        data.result.photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
      }
      
      return res.json(data.result);
    } catch (error) {
      console.error('Place details error:', error);
      return res.status(500).json({ error: 'Failed to fetch place details' });
    }
  });
}