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
import { identifyFoodFromImage, identifyFoodFromText } from '../../utils/geminiApi';
import { getNutrition } from '../../utils/spoonacularApi';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function TrackMeal() {
  const [mealDescription, setMealDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<MealType>('snack');
  const router = useRouter();

  const pickImage = async (sourceType: 'camera' | 'library') => {
    try {
      // For iOS Simulator, we'll use a simplified configuration
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing in simulator
        quality: 1,
        // Remove aspect ratio constraint for simulator
      };

      // In simulator, camera won't work, so default to library if camera is selected
      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to access photo library. Please try again.'
      );
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
      
      if (selectedImage) {
        foodInfo = await identifyFoodFromImage(selectedImage, mealDescription);
      } else if (mealDescription) {
        foodInfo = await identifyFoodFromText(mealDescription);
      }

      if (!foodInfo) {
        throw new Error('Failed to identify food');
      }

      console.log('Food identified:', foodInfo);
      const nutritionData = await getNutrition(foodInfo.description);
      
      if (!nutritionData) {
        throw new Error('Failed to get nutrition data');
      }

      console.log('Nutrition data:', nutritionData);
      router.push({
        pathname: "/dashboard",
        params: {
          newEntry: JSON.stringify({
            imageUri: selectedImage,
            description: foodInfo.description,
            nutrition: nutritionData,
            meal_type: mealType,
            notes: notes.trim() || undefined
          }),
        },
      });
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      Alert.alert('Error', 'Failed to analyze nutrition. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MealTypeButton = ({ type, label }: { type: MealType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.mealTypeButton,
        mealType === type && styles.mealTypeButtonSelected
      ]}
      onPress={() => setMealType(type)}
    >
      <Text style={[
        styles.mealTypeButtonText,
        mealType === type && styles.mealTypeButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
                onPress={() => pickImage('camera')}
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
                onPress={() => pickImage('library')}
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
                  onPress={() => pickImage('library')}
                >
                  <Ionicons name="cloud-upload" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Change</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.cameraButton, styles.halfButton]}
                  onPress={() => pickImage('camera')}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Meal Type Selection */}
            <View style={styles.mealTypeContainer}>
              <Text style={styles.sectionTitle}>Meal Type</Text>
              <View style={styles.mealTypeButtons}>
                <MealTypeButton type="breakfast" label="Breakfast" />
                <MealTypeButton type="lunch" label="Lunch" />
                <MealTypeButton type="dinner" label="Dinner" />
                <MealTypeButton type="snack" label="Snack" />
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Describe your meal (optional)..."
              placeholderTextColor="#666"
              value={mealDescription}
              onChangeText={setMealDescription}
              multiline
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes (optional)..."
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
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
  mealTypeContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  mealTypeButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  mealTypeButtonSelected: {
    backgroundColor: '#00ff9d',
  },
  mealTypeButtonText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  mealTypeButtonTextSelected: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  notesInput: {
    height: 80,
  },
}); 