import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'nutrition_entries';

interface NutritionEntry {
  id: string;
  date: string;
  imageUri?: string;
  nutrition: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  description: string;
}

export default function Dashboard() {
  const { signOut } = useAuth();
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const params = useLocalSearchParams();

  // Load entries from storage on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEntries) {
        setNutritionEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const saveEntries = async (entries: NutritionEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  };

  useEffect(() => {
    if (params.newEntry) {
      try {
        const newEntry = JSON.parse(params.newEntry as string) as NutritionEntry;
        
        // Check if entry with this ID already exists
        const entryExists = nutritionEntries.some(entry => entry.id === newEntry.id);
        
        if (!entryExists) {
          const updatedEntries = [newEntry, ...nutritionEntries];
          setNutritionEntries(updatedEntries);
          saveEntries(updatedEntries);
        }
      } catch (error) {
        console.error('Error parsing new entry:', error);
      }
    }
  }, [params.newEntry]);

  // Calculate totals whenever entries change
  useEffect(() => {
    const totals = nutritionEntries.reduce((acc, entry) => ({
      calories: (acc.calories || 0) + (entry.nutrition.calories || 0),
      protein: (acc.protein || 0) + (entry.nutrition.protein || 0),
      carbs: (acc.carbs || 0) + (entry.nutrition.carbs || 0),
      fat: (acc.fat || 0) + (entry.nutrition.fat || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    
    setDailyTotals(totals);
  }, [nutritionEntries]);

  const deleteEntry = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedEntries = nutritionEntries.filter(entry => entry.id !== id);
            setNutritionEntries(updatedEntries);
            await saveEntries(updatedEntries);
          }
        }
      ]
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteEntry(id)}
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>CalorieCanvas</Text>
          <Text style={styles.tagline}>Track your nutrition with precision</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Daily Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.calories)}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.protein)}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.carbs)}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.fat)}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.recentEntries}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {nutritionEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No entries yet. Go to the Track Meal tab to get started!
              </Text>
            </View>
          ) : (
            nutritionEntries.map((entry) => (
              <Swipeable
                key={entry.id}
                renderRightActions={() => renderRightActions(entry.id)}
              >
                <View style={styles.entryCard}>
                  {entry.imageUri && (
                    <Image
                      source={{ uri: entry.imageUri }}
                      style={styles.entryImage}
                    />
                  )}
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDescription}>{entry.description}</Text>
                    <Text style={styles.entryNutrition}>
                      {Math.round(entry.nutrition.calories || 0)} cal • {Math.round(entry.nutrition.protein || 0)}g protein • {Math.round(entry.nutrition.carbs || 0)}g carbs • {Math.round(entry.nutrition.fat || 0)}g fat
                    </Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff9d',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#888',
  },
  recentEntries: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  entryImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  entryDetails: {
    padding: 16,
  },
  entryDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  entryNutrition: {
    fontSize: 14,
    color: '#00ff9d',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  entryDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
}); 