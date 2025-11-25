import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Alert, Text } from 'react-native';

// Screens
import { OCRScreen } from './src/screens/OCRScreen';
import { DiscogsSearchScreen } from './src/screens/DiscogsSearchScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';

// Utils & Types
import { api } from './src/utils/api';
import type { VinylData, VinylRecord } from './src/types';
import type { DiscogsReleaseDetails } from './src/utils/discogs';

const Tab = createBottomTabNavigator();

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<VinylData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [records, setRecords] = useState<VinylRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const data = await api.getRecords();
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Failed to load records');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      setExtractedData(null);
      setIsProcessing(false);
      Alert.alert(
        'OCR Note',
        'OCR processing requires cloud integration. For now, you can manually enter data or use Discogs search.'
      );
    }, 2000);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setExtractedData(null);
    setIsProcessing(false);
  };

  const handleDataUpdate = async (data: VinylData) => {
    setExtractedData(data);
  };

  const handleSaveRecord = async () => {
    if (!extractedData) {
      Alert.alert('No Data', 'Please extract or enter vinyl data first');
      return;
    }

    setIsSaving(true);
    try {
      await api.createRecord({
        ...extractedData,
        imageUrl: uploadedImage || undefined,
      });

      Alert.alert('Success', 'Record saved to collection!');

      // Reset form
      handleReset();

      // Reload records
      await loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectRelease = async (release: DiscogsReleaseDetails) => {
    setIsSaving(true);
    try {
      // Extract data from Discogs release
      const vinylData: Partial<VinylData> = {
        artistName: release.artists?.[0]?.name || '',
        albumName: release.title || '',
        serialNumber: release.labels?.[0]?.catno || '',
        matrixRunout: release.identifiers?.find(id => id.type === 'Matrix / Runout')?.value || '',
        year: release.year,
        country: release.country,
        genre: release.genres,
        style: release.styles,
        label: release.labels?.[0]?.name,
        format: release.formats?.[0]?.name,
        discogsId: release.id,
        discogsUrl: release.uri,
      };

      // Get cover image URL
      const coverImageUrl = release.images?.[0]?.uri || release.images?.[0]?.uri150 || undefined;

      await api.createRecord({
        ...vinylData,
        imageUrl: coverImageUrl,
      });

      Alert.alert('Success', 'Record added to collection!');

      // Reload records
      await loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to add record to collection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await api.deleteRecord(id);
      Alert.alert('Deleted', 'Record removed from collection');
      await loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete record');
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#1a1a1a',
              borderTopColor: '#333',
            },
            tabBarActiveTintColor: '#4a9eff',
            tabBarInactiveTintColor: '#999',
            headerStyle: {
              backgroundColor: '#1a1a1a',
              borderBottomColor: '#333',
            },
            headerTintColor: '#e8e8e8',
          }}
        >
          <Tab.Screen
            name="OCR"
            options={{
              title: 'OCR',
              tabBarLabel: 'OCR',
            }}
          >
            {() => (
              <OCRScreen
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                onReset={handleReset}
                isProcessing={isProcessing}
                extractedData={extractedData}
                onDataUpdate={handleDataUpdate}
                onSave={handleSaveRecord}
                isSaving={isSaving}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Search"
            options={{
              title: 'Discogs',
              tabBarLabel: 'Search',
            }}
          >
            {() => <DiscogsSearchScreen onSelectRelease={handleSelectRelease} />}
          </Tab.Screen>

          <Tab.Screen
            name="Collection"
            options={{
              title: 'Collection',
              tabBarLabel: 'Collection',
              tabBarBadge: records.length > 0 ? records.length : undefined,
            }}
          >
            {() => (
              <CollectionScreen
                records={records}
                isLoading={isLoadingRecords}
                onDelete={handleDeleteRecord}
                onRefresh={loadRecords}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
