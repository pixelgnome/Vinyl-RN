export interface VinylData {
  artistName: string;
  albumName: string;
  serialNumber: string;
  matrixRunout: string;
  // Optional Discogs metadata
  year?: number;
  country?: string;
  genre?: string[];
  style?: string[];
  label?: string;
  format?: string;
  discogsId?: number;
  discogsUrl?: string;
}

export interface VinylRecord extends VinylData {
  id: string;
  imageUrl: string | null;
  createdAt: number;
  updatedAt: number;
}
