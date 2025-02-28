import axios from 'axios';

interface GeocodingAddress {
  street?: string;
  city: string;
  state?: string;
  country: string;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function geocodeAddress(address: GeocodingAddress): Promise<[number, number]> {
  let lastError;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await wait(1000 * attempt); // Wait before retrying
      }

      const { data } = await axios.post('/api/geocode', address, {
        timeout: 15000, // 15 second timeout
      });
      
      return data.coordinates;
    } catch (error) {
      lastError = error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Location not found for ${address.city}, ${address.country}`);
      }
      // Continue to next retry if not 404
    }
  }

  // If all retries failed
  throw new Error(
    `Failed to geocode location after multiple attempts: ${
      axios.isAxiosError(lastError) 
        ? lastError.response?.data?.error || lastError.message 
        : 'Unknown error'
    }`
  );
}