import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card } from '../components/ui';
import { VinylData } from '../types';

interface OCRScreenProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
  onReset: () => void;
  isProcessing: boolean;
  extractedData: VinylData | null;
  onDataUpdate: (data: VinylData) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const OCRScreen: React.FC<OCRScreenProps> = ({
  onImageUpload,
  uploadedImage,
  onReset,
  isProcessing,
  extractedData,
  onDataUpdate,
  onSave,
  isSaving,
}) => {
  const [requestingPermission, setRequestingPermission] = useState(false);

  const requestCameraPermission = async () => {
    setRequestingPermission(true);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setRequestingPermission(false);

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.'
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    setRequestingPermission(true);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setRequestingPermission(false);

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Media library permission is required to choose photos.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      onImageUpload(imageUri);
    }
  };

  const handleChooseFile = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      onImageUpload(imageUri);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Upload Vinyl Label</Text>

      {!uploadedImage ? (
        <Card>
          {/* Upload Area */}
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleChooseFile}
            disabled={requestingPermission}
          >
            <Text style={styles.uploadIcon}>📤</Text>
            <Text style={styles.uploadText}>Tap to upload image</Text>
            <Text style={styles.uploadSubtext}>Supports JPG, PNG formats</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleChooseFile}
                title="Choose File"
                disabled={requestingPermission}
                style={styles.button}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleTakePhoto}
                title="Take Photo"
                variant="outline"
                disabled={requestingPermission}
                style={styles.button}
              />
            </View>
          </View>
        </Card>
      ) : (
        <Card>
          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: uploadedImage }} style={styles.image} resizeMode="contain" />
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#4a9eff" />
                <Text style={styles.processingText}>Processing OCR...</Text>
              </View>
            )}
          </View>

          {/* Reset Button */}
          <Button
            onPress={onReset}
            title="Upload Different Image"
            variant="outline"
            style={styles.resetButton}
          />
        </Card>
      )}

      {/* Data Display Section */}
      {extractedData && (
        <Card style={styles.dataCard}>
          <DataDisplaySection
            data={extractedData}
            onDataUpdate={onDataUpdate}
            onSave={onSave}
            isSaving={isSaving}
          />
        </Card>
      )}
    </ScrollView>
  );
};

// Simplified DataDisplay for OCR screen
const DataDisplaySection: React.FC<{
  data: VinylData;
  onDataUpdate: (data: VinylData) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({ data, onDataUpdate, onSave, isSaving }) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Extracted Data</Text>
      <Text style={styles.infoText}>
        Note: OCR functionality requires cloud integration
      </Text>

      <Button
        onPress={onSave}
        title={isSaving ? "Saving..." : "Save to Collection"}
        disabled={isSaving}
        loading={isSaving}
        style={styles.saveButton}
      />
    </View>
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
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#333',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#e8e8e8',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(33, 33, 33, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#e8e8e8',
    marginTop: 12,
    fontSize: 16,
  },
  resetButton: {
    marginTop: 8,
  },
  dataCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
