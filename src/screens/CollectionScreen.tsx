import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button } from '../components/ui';
import { AlbumCover } from '../components/AlbumCover';
import { VinylRecord } from '../types';

interface CollectionScreenProps {
  records: VinylRecord[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  records,
  isLoading,
  onDelete,
  onRefresh,
}) => {
  const handleDelete = (record: VinylRecord) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.albumName}" by ${record.artistName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(record.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#4a9eff" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Vinyl Collection</Text>
          <Text style={styles.subtitle}>
            {records.length} {records.length === 1 ? 'record' : 'records'} in your collection
          </Text>
        </View>
      </View>

      {/* Empty State */}
      {!isLoading && records.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💿</Text>
          <Text style={styles.emptyTitle}>No Records Yet</Text>
          <Text style={styles.emptyText}>
            Start building your collection by uploading or searching for vinyl records
          </Text>
        </Card>
      )}

      {/* Records List */}
      {records.map((record) => (
        <Card key={record.id} style={styles.recordCard}>
          <View style={styles.recordContent}>
            <AlbumCover
              artistName={record.artistName}
              albumName={record.albumName}
              uploadedImageUrl={record.imageUrl}
              size={100}
            />

            <View style={styles.recordInfo}>
              {record.artistName && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Artist</Text>
                  <Text style={styles.infoValue}>{record.artistName}</Text>
                </View>
              )}

              {record.albumName && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Album</Text>
                  <Text style={styles.infoValue}>{record.albumName}</Text>
                </View>
              )}

              {record.year && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Year</Text>
                  <Text style={styles.infoValue}>{record.year}</Text>
                </View>
              )}

              <Text style={styles.dateText}>Added {formatDate(record.createdAt)}</Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(record)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e8e8e8',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recordCard: {
    marginBottom: 16,
  },
  recordContent: {
    flexDirection: 'row',
    gap: 16,
  },
  recordInfo: {
    flex: 1,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#e8e8e8',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ef4444',
  },
});
