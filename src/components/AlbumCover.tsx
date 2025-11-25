import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface AlbumCoverProps {
  artistName: string;
  albumName: string;
  uploadedImageUrl?: string | null;
  size?: number;
}

export const AlbumCover: React.FC<AlbumCoverProps> = ({
  artistName,
  albumName,
  uploadedImageUrl,
  size = 200,
}) => {
  // Use uploaded image if available
  if (uploadedImageUrl) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={{ uri: uploadedImageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Show placeholder
  return (
    <View style={[styles.container, styles.placeholder, { width: size, height: size }]}>
      <Text style={styles.placeholderIcon}>💿</Text>
      <Text style={styles.placeholderText} numberOfLines={2}>
        {albumName || 'No Image'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});
