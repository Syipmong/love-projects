/**
 * Pexels API Integration Service
 * Strict TypeScript implementation
 */

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string; // Pexels page
  imageUrl: string; // Optimized display image for polaroid
  thumbnailUrl: string; // Fast thumbnail for gallery
  alt: string;
  photographer: string;
  photographerUrl: string;
  avgColor?: string;
}

export interface PexelsSearchResponse {
  success: boolean;
  total_results?: number;
  page?: number;
  per_page?: number;
  photos: PexelsPhoto[];
  error?: string;
}

const PEXELS_API_URL = 'https://api.pexels.com/v1';

export async function searchPexelsImages(
  query: string,
  page = 1,
  perPage = 16
): Promise<PexelsSearchResponse> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      photos: [],
      error: 'PEXELS_API_KEY is not configured on the server'
    };
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim() || 'romantic couple');
    const url = `${PEXELS_API_URL}/search?query=${encodedQuery}&page=${page}&per_page=${perPage}&orientation=landscape`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Pexels API error response:', res.status, errText);
      return {
        success: false,
        photos: [],
        error: `Pexels API responded with status ${res.status}`
      };
    }

    const data = await res.json() as {
      total_results?: number;
      page?: number;
      per_page?: number;
      photos?: Array<{
        id: number;
        width: number;
        height: number;
        url: string;
        alt?: string;
        photographer: string;
        photographer_url?: string;
        avg_color?: string;
        src: {
          original?: string;
          large2x?: string;
          large?: string;
          medium?: string;
          small?: string;
          portrait?: string;
          landscape?: string;
          tiny?: string;
        };
      }>;
    };

    const photos: PexelsPhoto[] = (data.photos || []).map((p) => ({
      id: p.id,
      width: p.width,
      height: p.height,
      url: p.url,
      imageUrl: p.src.large || p.src.medium || p.src.original || '',
      thumbnailUrl: p.src.medium || p.src.small || p.src.tiny || '',
      alt: p.alt || 'Romantic memory',
      photographer: p.photographer || 'Pexels Creator',
      photographerUrl: p.photographer_url || '',
      avgColor: p.avg_color
    }));

    return {
      success: true,
      total_results: data.total_results || photos.length,
      page: data.page || page,
      per_page: data.per_page || perPage,
      photos
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to search Pexels images:', message);
    return {
      success: false,
      photos: [],
      error: message
    };
  }
}

export async function getCuratedPexelsImages(
  page = 1,
  perPage = 16
): Promise<PexelsSearchResponse> {
  // Defaults to romantic couple queries for best romantic experience
  return searchPexelsImages('romantic couple love', page, perPage);
}

