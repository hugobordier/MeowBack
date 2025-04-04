import axios from 'axios';

export async function getCoordinatesFromAddress(
  address: string
): Promise<{ lat: number | null; lon: number | null }> {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'pet-sitting-app/1.0 (tonton@exemple.com)',
        },
      }
    );

    const data = response.data;

    if (data.length === 0) {
      return { lat: null, lon: null };
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Erreur lors de la géolocalisation:', error);
    return { lat: null, lon: null };
  }
}
