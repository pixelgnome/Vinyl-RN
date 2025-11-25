import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card, Button, Input } from '../components/ui';
import { AlbumCover } from '../components/AlbumCover';
import {
  discogsAPI,
  DiscogsSearchResult,
  DiscogsReleaseDetails,
} from '../utils/discogs';

interface DiscogsSearchScreenProps {
  onSelectRelease: (release: DiscogsReleaseDetails) => void;
}

export const DiscogsSearchScreen: React.FC<DiscogsSearchScreenProps> = ({
  onSelectRelease,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DiscogsSearchResult[]>([]);
  const [isConfigured] = useState(discogsAPI.isConfigured());

  const handleSearch = async () => {
    if (!isConfigured) {
      Alert.alert('Configuration Required', 'Please configure your Discogs API credentials first');
      return;
    }

    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search query');
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      const response = await discogsAPI.search(searchQuery.trim(), 'release');
      setResults(response.results || []);

      if (!response.results || response.results.length === 0) {
        Alert.alert('No Results', 'No results found. Try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error',
        error instanceof Error ? error.message : 'Failed to search Discogs'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = async (result: DiscogsSearchResult) => {
    try {
      const releaseDetails = await discogsAPI.getRelease(result.id);

      // Show confirmation before adding
      Alert.alert(
        'Add to Collection',
        `Add "${releaseDetails.title}" to your collection?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: () => onSelectRelease(releaseDetails),
          },
        ]
      );
    } catch (error) {
      console.error('Error fetching release details:', error);
      Alert.alert('Error', 'Failed to fetch release details');
    }
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Configuration Required</Text>
          <Text style={styles.errorText}>
            Please configure your Discogs API token in the .env file to use this feature.
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Search Discogs</Text>

      <Card style={styles.searchCard}>
        <Input
          placeholder="Search for artist, album, or catalog number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button
          onPress={handleSearch}
          title="Search"
          disabled={isSearching}
          loading={isSearching}
          style={styles.searchButton}
        />
      </Card>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!isSearching && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            Found {results.length} results
          </Text>

          {results.map((result) => (
            <TouchableOpacity
              key={result.id}
              onPress={() => handleSelectResult(result)}
              activeOpacity={0.7}
            >
              <Card style={styles.resultCard}>
                <View style={styles.resultContent}>
                  <AlbumCover
                    artistName={result.title.split(' - ')[0] || ''}
                    albumName={result.title}
                    uploadedImageUrl={result.thumb}
                    size={80}
                  />

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {result.title}
                    </Text>

                    {result.year && (
                      <Text style={styles.resultDetail}>Year: {result.year}</Text>
                    )}

                    {result.country && (
                      <Text style={styles.resultDetail}>Country: {result.country}</Text>
                    )}

                    {result.format && result.format.length > 0 && (
                      <Text style={styles.resultDetail}>
                        Format: {result.format.join(', ')}
                      </Text>
                    )}

                    {result.label && result.label.length > 0 && (
                      <Text style={styles.resultDetail} numberOfLines={1}>
                        Label: {result.label.join(', ')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e8e8e8',
    marginBottom: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: 12,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: 6,
  },
  resultDetail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  addButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorCard: {
    marginTop: 32,
    padding: 32,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
