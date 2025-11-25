# Vinyl Collection Manager - React Native

This is a React Native (Expo) conversion of the Vinyl$ User Interface web application. It allows users to manage their vinyl record collection with features including:

- 📷 **OCR Upload**: Upload vinyl label photos (OCR integration ready for cloud services)
- 🔍 **Discogs Search**: Search and add vinyl records from the Discogs database
- 💿 **Collection Management**: View, organize, and delete records in your collection

## Project Structure

```
Vinyl-RN/
├── App.tsx                    # Main app with navigation
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI components (Button, Card, Input)
│   │   └── AlbumCover.tsx    # Album cover image component
│   ├── screens/
│   │   ├── OCRScreen.tsx           # Camera/image upload screen
│   │   ├── DiscogsSearchScreen.tsx # Discogs search interface
│   │   └── CollectionScreen.tsx    # Collection view
│   ├── utils/
│   │   ├── api.ts            # AsyncStorage data persistence
│   │   └── discogs.ts        # Discogs API client
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── .env                      # Environment variables (Discogs API token)
└── package.json
```

## Features

### ✅ Fully Converted Features

1. **Discogs API Integration**
   - Search vinyl records by artist, album, or barcode
   - Fetch detailed release information
   - Automatically save records with metadata to collection

2. **Local Data Persistence**
   - Uses AsyncStorage for offline-first data storage
   - Create, read, update, delete (CRUD) operations
   - Persistent collection across app restarts

3. **Image Handling**
   - Camera integration with expo-image-picker
   - Photo library access
   - Image preview and upload
   - Album cover display from Discogs or uploaded images

4. **Navigation**
   - Bottom tab navigation with 3 screens
   - Tab badges showing collection count
   - Dark theme UI matching original design

### 🚧 Features Requiring Additional Setup

1. **OCR (Optical Character Recognition)**
   - Currently shows placeholder/simulation
   - Requires integration with cloud OCR service (Google Vision API, AWS Textract, etc.)
   - Architecture is ready - just needs API implementation

## Setup & Installation

1. **Install Dependencies**
   ```bash
   cd Vinyl-RN
   npm install
   ```

2. **Configure Discogs API**
   - Get a Personal Access Token from https://www.discogs.com/settings/developers
   - Add it to `.env`:
     ```
     EXPO_PUBLIC_DISCOGS_TOKEN=your_token_here
     ```

3. **Run the App**
   ```bash
   npm start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Key Differences from Web Version

### Technology Stack

| Feature | Web Version | React Native Version |
|---------|------------|---------------------|
| Framework | React + Vite | React Native + Expo |
| UI Library | Radix UI + Tailwind CSS | Custom StyleSheet components |
| Storage | localStorage | AsyncStorage |
| Image Picker | HTML5 File Input | expo-image-picker |
| Navigation | Tab component | React Navigation |
| Clipboard | navigator.clipboard | @expo/clipboard (ready to add) |
| OCR | Tesseract.js | Cloud OCR API (ready to integrate) |

### Code Reuse

- **100% reusable**: Discogs API client (`discogs.ts`) - works identically
- **95% reusable**: Data persistence logic (`api.ts`) - only storage backend changed
- **80% reusable**: Business logic and data flow - same patterns and structure
- **Converted**: UI components to React Native equivalents with StyleSheet

## Next Steps

### To Enable OCR Functionality

1. Choose a cloud OCR provider:
   - **Google Cloud Vision API** (recommended for accuracy)
   - **AWS Textract**
   - **Azure Computer Vision**
   - **OCR.space** (free tier available)

2. Add API integration in `src/screens/OCRScreen.tsx`:
   ```typescript
   const processImageWithOCR = async (imageUri: string) => {
     // Convert image to base64
     // Send to OCR API
     // Parse response and extract vinyl data
     // Update extractedData state
   };
   ```

3. Update `handleImageUpload` to call the OCR function

### To Add Clipboard Support

```bash
npx expo install expo-clipboard
```

Then update DataDisplay component to use Clipboard API.

### To Add Additional Features

- **Barcode Scanner**: Add expo-barcode-scanner for scanning vinyl barcodes
- **Photo Filters**: Add expo-image-manipulator for image enhancement before OCR
- **Cloud Backup**: Sync collection data to Firebase or Supabase
- **Sharing**: Add share functionality to share collection with friends

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Running on Device
```bash
# iOS
npm run ios

# Android
npm run android
```

### Building for Production
```bash
# Create production build
eas build --platform ios
eas build --platform android
```

## Dependencies

### Core
- React Native (via Expo SDK 54)
- TypeScript
- React Navigation

### Libraries
- @react-native-async-storage/async-storage - Local data persistence
- expo-image-picker - Camera and photo library access
- expo-status-bar - Status bar customization

### API Integration
- Discogs API - Vinyl record database

## Original Web Project

The web version is located at: `../Vinyl$ User Interface/`

## License

Same as original project
