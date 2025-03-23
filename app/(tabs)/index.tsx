import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { identifyFoodFromImage, identifyFoodFromText } from '../../src/utils/geminiApi';
import { parseAndAnalyzeIngredients } from '../../src/utils/spoonacularApi';

export default function TrackMeal() {
  const [mealDescription, setMealDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleImagePick = async () => {
    try {
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload food photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setSelectedImage(base64Image);
          setMealDescription(''); // Clear description when new image is selected
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from library');
      console.error(error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera to take food photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setSelectedImage(base64Image);
          setMealDescription(''); // Clear description when new photo is taken
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error(error);
    }
  };

  const handleAnalyzeNutrition = async () => {
    if (!selectedImage && !mealDescription.trim()) {
      Alert.alert('Missing Input', 'Please provide an image and/or description of your meal');
      return;
    }

    setIsAnalyzing(true);
    try {
      let foodInfo;
      
      // If there's an image, analyze it with Gemini first
      if (selectedImage) {
        foodInfo = await identifyFoodFromImage(selectedImage, mealDescription);
      } else if (mealDescription) {
        foodInfo = await identifyFoodFromText(mealDescription);
      }

      if (!foodInfo) {
        throw new Error('Failed to identify food');
      }

      // Get nutrition data from Spoonacular
      const nutritionData = await parseAndAnalyzeIngredients(foodInfo.ingredients);
      
      // Navigate to dashboard with the new entry
      router.push({
        pathname: "/dashboard",
        params: {
          newEntry: JSON.stringify({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            imageUri: selectedImage,
            description: foodInfo.description,
            nutrition: nutritionData,
          }),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze nutrition. Please try again.');
      console.error('Error in food analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Track Your Meal</Text>
            
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.image} />
            ) : (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleTakePhoto}
              >
                <View style={styles.scanButtonContent}>
                  <Ionicons name="scan-circle-outline" size={80} color="#4CAF50" />
                  <Text style={styles.scanButtonText}>Scan Food</Text>
                </View>
              </TouchableOpacity>
            )}
            
            {!selectedImage && (
              <TouchableOpacity
                style={[styles.button, styles.uploadButton]}
                onPress={handleImagePick}
              >
                <Ionicons name="cloud-upload" size={24} color="#fff" />
                <Text style={styles.buttonText}>
                  Upload from Photos
                </Text>
              </TouchableOpacity>
            )}

            {selectedImage && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.uploadButton, styles.halfButton]}
                  onPress={handleImagePick}
                >
                  <Ionicons name="cloud-upload" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Change</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.cameraButton, styles.halfButton]}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Describe your meal (optional)..."
              placeholderTextColor="#666"
              value={mealDescription}
              onChangeText={setMealDescription}
              multiline
            />

            <TouchableOpacity
              style={[styles.button, styles.analyzeButton, isAnalyzing && styles.disabledButton]}
              onPress={handleAnalyzeNutrition}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="nutrition" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Analyze Nutrition</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for Better Results:</Text>
              <View style={styles.tipRow}>
                <Ionicons name="camera" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Take clear, well-lit photos</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="restaurant" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Include all items in the frame</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="text" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Add descriptions for better accuracy</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // White text
  },
  scanButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  scanButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 225,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  halfButton: {
    width: '48%',
    marginBottom: 0,
  },
  uploadButton: {
    backgroundColor: '#4CAF50', // Green
  },
  cameraButton: {
    backgroundColor: '#FF9800', // Orange
  },
  analyzeButton: {
    backgroundColor: '#2196F3', // Blue
    width: '100%',
    marginBottom: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  input: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#333', // Darker border
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    backgroundColor: '#1a1a1a', // Slightly lighter than background
    color: '#fff', // White text
  },
  tipsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 16,
  },
}); 