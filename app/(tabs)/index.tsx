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
import { analyzeNutrition } from '../../src/utils/nutritionApi';

export default function TrackMeal() {
  const [mealDescription, setMealDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permission to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleAnalyzeNutrition = async () => {
    if (!selectedImage && !mealDescription.trim()) {
      Alert.alert('Missing Input', 'Please provide an image and/or description of your meal');
      return;
    }

    setIsAnalyzing(true);
    try {
      const nutritionData = await analyzeNutrition(selectedImage, mealDescription);
      
      // Navigate to dashboard with the new entry
      router.push({
        pathname: "/(tabs)/dashboard",
        params: {
          newEntry: JSON.stringify({
            id: Date.now().toString(),
            date: new Date(),
            imageUri: selectedImage,
            description: nutritionData.description,
            nutrition: {
              calories: nutritionData.calories,
              protein: nutritionData.protein,
              carbs: nutritionData.carbs,
              fat: nutritionData.fat,
            },
          }),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze nutrition. Please try again.');
      console.error(error);
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
          <Text style={styles.logo}>CalorieCanvas</Text>
          <Text style={styles.tagline}>Track your nutrition with precision</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Image (Optional)</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUploadPhoto}
              >
                <Ionicons name="cloud-upload" size={24} color="white" />
                <Text style={styles.buttonText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.clearImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your meal (e.g. '2 drumsticks and a cup of milk')"
              placeholderTextColor="#666"
              value={mealDescription}
              onChangeText={setMealDescription}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!selectedImage && !mealDescription.trim() || isAnalyzing) && styles.disabledButton
            ]}
            onPress={handleAnalyzeNutrition}
            disabled={(!selectedImage && !mealDescription.trim()) || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Nutrition</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            You can analyze nutrition using an image, description, or both for best results
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  clearImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  descriptionInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 100,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#00ff9d',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#444',
    opacity: 0.7,
  },
  hint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
}); 