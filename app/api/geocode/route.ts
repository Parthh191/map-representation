import { NextResponse } from 'next/server';
import axios from 'axios';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const DELAY_BETWEEN_REQUESTS = 2000; // 200ms delay between requests
let lastRequestTime = 0;

async function waitForDelay() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < DELAY_BETWEEN_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

async function geocodeWithRetry(query: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios({
        method: 'get',
        url: 'https://api.geoapify.com/v1/geocode/search',
        params: {
          text: query,
          format: 'json',
          apiKey: GEOAPIFY_API_KEY,
          limit: 1
        },
        timeout: 10000, // 10 second timeout
      });

      if (data?.results?.[0]) {
        return data.results[0];
      }
      
      // If no results found, return null instead of throwing
      if (i === retries - 1) {
        return null;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  return null;
}

export async function POST(req: Request) {
  if (!GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: 'Geocoding service not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { city, state, country } = body;

    await waitForDelay();

    const query = [city, state, country]
      .filter(Boolean)
      .join(", ");

    const location = await geocodeWithRetry(query);

    if (!location) {
      // Return a default location when geocoding fails
      return NextResponse.json({
        coordinates: [0, 0],
        warning: 'Location not found, using default coordinates'
      });
    }

    return NextResponse.json({
      coordinates: [parseFloat(location.lat), parseFloat(location.lon)]
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    // Return default coordinates instead of error
    return NextResponse.json({
      coordinates: [0, 0],
      warning: 'Geocoding failed, using default coordinates'
    });
  }
}