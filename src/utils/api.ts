// ============================================================================
// ASYNC STORAGE API - React Native implementation
// ============================================================================
// This file handles storing vinyl records in React Native's AsyncStorage.
// It's separate from the Discogs API integration.
//
// DISCOGS INTEGRATION:
// When a user selects a release from Discogs (via DiscogsSearch component),
// the Discogs data is passed to createRecord() and stored with these fields:
// - discogsId: The Discogs release ID
// - discogsUrl: Link to the release on Discogs
// - year, country, genre, style, label, format: Metadata from Discogs
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VinylData, VinylRecord } from '../types';

const STORAGE_KEY = 'vinyl_records';

// Helper to get records from AsyncStorage
async function getStoredRecords(): Promise<VinylRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from AsyncStorage:', error);
    return [];
  }
}

// Helper to save records to AsyncStorage
async function saveRecords(records: VinylRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving to AsyncStorage:', error);
    throw new Error('Failed to save data');
  }
}

export const api = {
  // Get all vinyl records
  async getRecords(): Promise<VinylRecord[]> {
    return getStoredRecords();
  },

  // Get a single record
  async getRecord(id: string): Promise<VinylRecord> {
    const records = await getStoredRecords();
    const record = records.find(r => r.id === id);
    if (!record) {
      throw new Error('Record not found');
    }
    return record;
  },

  // Create a new record
  async createRecord(record: Partial<VinylData> & { imageUrl?: string }): Promise<VinylRecord> {
    const records = await getStoredRecords();
    const now = Date.now();

    const newRecord: VinylRecord = {
      id: `record_${now}_${Math.random().toString(36).substr(2, 9)}`,
      artistName: record.artistName || '',
      albumName: record.albumName || '',
      serialNumber: record.serialNumber || '',
      matrixRunout: record.matrixRunout || '',
      imageUrl: record.imageUrl || null,
      // DISCOGS DATA: These optional fields come from Discogs API
      // They're populated when user adds a vinyl from Discogs search results
      year: record.year,
      country: record.country,
      genre: record.genre,
      style: record.style,
      label: record.label,
      format: record.format,
      discogsId: record.discogsId,
      discogsUrl: record.discogsUrl,
      createdAt: now,
      updatedAt: now,
    };

    records.push(newRecord);
    await saveRecords(records);
    return newRecord;
  },

  // Update a record
  async updateRecord(id: string, updates: Partial<VinylData>): Promise<VinylRecord> {
    const records = await getStoredRecords();
    const index = records.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Record not found');
    }

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: Date.now(),
    };

    await saveRecords(records);
    return records[index];
  },

  // Delete a record
  async deleteRecord(id: string): Promise<void> {
    const records = await getStoredRecords();
    const filtered = records.filter(r => r.id !== id);
    await saveRecords(filtered);
  },

  // Upload an image (store as base64 in the record)
  async uploadImage(image: string, recordId?: string): Promise<string> {
    // In a frontend-only version, we just return the base64 image
    return image;
  },
};
