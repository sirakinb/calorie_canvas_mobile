import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { identifyFoodFromImage, identifyFoodFromText } from '../utils/geminiApi';
import { getNutritionForMeal } from '../utils/spoonacularApi';

export default function TrackMeal() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera permission to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const analyzeMeal = async () => {
    if (!imageUri && !description) {
      Alert.alert('Input Required', 'Please provide an image or description of your meal.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Identify food using Gemini
      const foodData = imageUri 
        ? await identifyFoodFromImage(imageUri, description)
        : await identifyFoodFromText(description);

      console.log('Identified ingredients:', foodData.ingredients);

      // Step 2: Get nutrition data from Spoonacular
      const nutritionData = await getNutritionForMeal(foodData.ingredients);

      // Create entry object
      const entry = {
        id: Date.now().toString(),
        date: new Date(),
        imageUri,
        description: foodData.description,
        nutrition: nutritionData,
      };

      // Navigate back to dashboard with the new entry
      router.push({
        pathname: "/(tabs)/",
        params: { newEntry: JSON.stringify(entry) }
      });
    } catch (error) {
      console.error('Error analyzing meal:', error);
      Alert.alert(
        'Error',
        'Failed to analyze the meal. Please try again or check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#666"
      />

      <TouchableOpacity 
        style={[styles.analyzeButton, loading && styles.disabledButton]}
        onPress={analyzeMeal}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Meal</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    width: '48%',
  },
  buttonText: {
    color: '#00ff9d',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#00ff9d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 