// ============================================================================
// DISCOGS API CLIENT - React Native implementation
// ============================================================================
// This file contains the complete Discogs API integration for searching and
// retrieving vinyl record information from the Discogs database.
//
// Official API Documentation: https://www.discogs.com/developers
//
// ARCHITECTURE:
// - TypeScript interfaces define the shape of API responses
// - DiscogsAPI class handles all HTTP requests to Discogs
// - Singleton instance (discogsAPI) is exported for use throughout the app
// ============================================================================

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS - Discogs API Response Interfaces
// ----------------------------------------------------------------------------
// These interfaces map directly to the JSON responses from Discogs API endpoints

// Represents a basic release record (used in search results and collections)
export interface DiscogsRelease {
  id: number;
  title: string;
  year?: number;
  country?: string;
  label?: string[];
  catno?: string;
  format?: string[];
  genre?: string[];
  style?: string[];
  thumb?: string;
  cover_image?: string;
  resource_url?: string;
  master_id?: number;
  master_url?: string;
  uri?: string;
}

// Represents a single search result item returned from the /database/search endpoint
export interface DiscogsSearchResult {
  id: number;
  type: 'release' | 'master' | 'artist' | 'label';
  title: string;
  thumb: string;
  cover_image: string;
  country?: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
  catno?: string;
  barcode?: string[];
  resource_url: string;
}

// Full response structure from the Discogs search API
// Includes results array and pagination metadata
export interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: {
      last?: string;
      next?: string;
    };
  };
}

// Detailed release information returned from the /releases/{id} endpoint
// Contains complete metadata including tracklist, images, and identifiers
export interface DiscogsReleaseDetails {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    anv?: string;
    id: number;
  }>;
  year?: number;
  released?: string;
  country?: string;
  labels: Array<{
    name: string;
    catno: string;
    id: number;
  }>;
  formats: Array<{
    name: string;
    qty: string;
    descriptions?: string[];
  }>;
  genres?: string[];
  styles?: string[];
  tracklist?: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
  images?: Array<{
    type: string;
    uri: string;
    uri150: string;
    width: number;
    height: number;
  }>;
  identifiers?: Array<{
    type: string;
    value: string;
  }>;
  notes?: string;
  uri?: string;
  resource_url?: string;
}

// ----------------------------------------------------------------------------
// DISCOGS API CLIENT CLASS
// ----------------------------------------------------------------------------
// Main class that handles all communication with the Discogs API
// Supports Personal Access Token authentication
class DiscogsAPI {
  private baseUrl = 'https://api.discogs.com';
  private token: string | null = null;

  constructor() {
    // Initialize with credentials from environment variables
    this.token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN || null;
  }

  /**
   * Set authentication credentials manually
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.token;
  }

  /**
   * Get authentication headers for API requests
   * Adds Authorization header if using Personal Access Token
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'VinylCollectionApp/1.0',
    };

    if (this.token) {
      headers['Authorization'] = `Discogs token=${this.token}`;
    }

    return headers;
  }

  /**
   * Core HTTP request method - handles all API communication
   *
   * @param endpoint - API endpoint path (e.g., '/database/search')
   * @param params - Optional query parameters
   * @returns Parsed JSON response
   * @throws Error if API returns non-200 status or request fails
   */
  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Discogs API not configured. Please provide authentication credentials.');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add URL parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Discogs API error: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch data from Discogs API');
    }
  }

  // ------------------------------------------------------------------------
  // PUBLIC API METHODS
  // ------------------------------------------------------------------------
  // These methods are called by components to interact with Discogs

  /**
   * Search the Discogs database (uses /database/search endpoint)
   *
   * @param query - Search query string
   * @param type - Filter by type (release, master, artist, label)
   * @param page - Page number for pagination
   * @param perPage - Results per page
   * @returns Search results with pagination metadata
   */
  async search(
    query: string,
    type?: 'release' | 'master' | 'artist' | 'label',
    page: number = 1,
    perPage: number = 20
  ): Promise<DiscogsSearchResponse> {
    const params: Record<string, string> = {
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (type) {
      params.type = type;
    }

    return this.request<DiscogsSearchResponse>('/database/search', params);
  }

  /**
   * Search specifically for releases by artist and album name
   */
  async searchRelease(artist: string, album: string, page: number = 1): Promise<DiscogsSearchResponse> {
    const query = `${artist} ${album}`;
    return this.search(query, 'release', page);
  }

  /**
   * Get detailed information about a specific release (uses /releases/{id} endpoint)
   * Returns full metadata including tracklist, images, formats, and identifiers
   *
   * @param releaseId - The Discogs release ID
   * @returns Complete release details
   */
  async getRelease(releaseId: number): Promise<DiscogsReleaseDetails> {
    return this.request<DiscogsReleaseDetails>(`/releases/${releaseId}`);
  }

  /**
   * Get detailed information about a master release
   */
  async getMasterRelease(masterId: number): Promise<any> {
    return this.request(`/masters/${masterId}`);
  }

  /**
   * Search by barcode/UPC/EAN for exact matches
   * Useful for scanning physical vinyl barcodes
   *
   * @param barcode - Barcode, UPC, or EAN number
   * @returns Search results matching the barcode
   */
  async searchByBarcode(barcode: string): Promise<DiscogsSearchResponse> {
    return this.request<DiscogsSearchResponse>('/database/search', {
      barcode: barcode,
      type: 'release',
    });
  }

  /**
   * Search by catalog number (the label's unique identifier for a release)
   * Found on the spine or back of vinyl records
   *
   * @param catno - Catalog number (e.g., "MOVLP123")
   * @param page - Page number for pagination
   * @returns Search results matching the catalog number
   */
  async searchByCatalogNumber(catno: string, page: number = 1): Promise<DiscogsSearchResponse> {
    return this.request<DiscogsSearchResponse>('/database/search', {
      catno: catno,
      type: 'release',
      page: page.toString(),
    });
  }
}

// ----------------------------------------------------------------------------
// SINGLETON EXPORT
// ----------------------------------------------------------------------------
// Export a single shared instance of the API client
// This instance is imported and used by components throughout the app
// Usage: import { discogsAPI } from '../utils/discogs';
export const discogsAPI = new DiscogsAPI();
