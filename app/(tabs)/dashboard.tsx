import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface NutritionEntry {
  id: string;
  user_id: string;
  created_at: string;
  image_url?: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

const getMealTypeIcon = (type?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
  switch (type) {
    case 'breakfast':
      return 'sunny-outline';
    case 'lunch':
      return 'restaurant-outline';
    case 'dinner':
      return 'moon-outline';
    case 'snack':
      return 'cafe-outline';
    default:
      return 'nutrition-outline';
  }
};

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [deletedEntry, setDeletedEntry] = useState<NutritionEntry | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  
  const params = useLocalSearchParams();

  // Load entries from Supabase on mount
  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNutritionEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load nutrition entries');
    }
  };

  // Handle new entry from params
  useEffect(() => {
    if (params.newEntry && user) {
      try {
        const newEntryData = JSON.parse(params.newEntry as string);
        
        // Save to Supabase
        const saveEntry = async () => {
          const { error } = await supabase
            .from('nutrition_entries')
            .insert({
              user_id: user.id,
              image_url: newEntryData.imageUri,
              description: newEntryData.description,
              calories: Math.round(newEntryData.nutrition.calories),
              protein: Math.round(newEntryData.nutrition.protein),
              carbs: Math.round(newEntryData.nutrition.carbs),
              fat: Math.round(newEntryData.nutrition.fat),
              meal_type: newEntryData.meal_type,
              notes: newEntryData.notes,
              created_at: new Date().toISOString(),
            });

          if (error) {
            throw error;
          }

          // Reload entries to get the new one
          loadEntries();
        };

        saveEntry();
      } catch (error) {
        console.error('Error saving new entry:', error);
        Alert.alert('Error', 'Failed to save nutrition entry');
      }
    }
  }, [params.newEntry, user]);

  // Calculate totals whenever entries change
  useEffect(() => {
    const totals = nutritionEntries.reduce((acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    
    setDailyTotals(totals);
  }, [nutritionEntries]);

  const deleteEntry = async (id: string, entry: NutritionEntry) => {
    // Trigger haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Store the deleted entry for potential undo
      setDeletedEntry(entry);
      setShowUndo(true);

      // Update the UI immediately
      setNutritionEntries(prev => prev.filter(e => e.id !== id));

      // Hide undo option after 5 seconds
      setTimeout(() => {
        setShowUndo(false);
        setDeletedEntry(null);
      }, 5000);

    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const undoDelete = async () => {
    if (!deletedEntry) return;

    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .insert(deletedEntry);

      if (error) {
        throw error;
      }

      // Reload entries to get the restored entry
      loadEntries();
      setShowUndo(false);
      setDeletedEntry(null);

    } catch (error) {
      console.error('Error restoring entry:', error);
      Alert.alert('Error', 'Failed to restore entry');
    }
  };

  const renderRightActions = useCallback((id: string, entry: NutritionEntry) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
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
                onPress: () => deleteEntry(id, entry)
              }
            ]
          );
        }}
      >
        <MaterialIcons name="delete" size={24} color="white" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  }, []);

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
          <Text style={styles.title}>Calorie Canvas</Text>
          <Text style={styles.subtitle}>Track your nutrition with precision</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <Text style={styles.swipeHint}>
              <MaterialIcons name="swipe" size={16} color="#888" /> Swipe left to delete
            </Text>
          </View>
          
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
                renderRightActions={() => renderRightActions(entry.id, entry)}
                onSwipeableOpen={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View style={styles.entryCard}>
                  {entry.image_url && (
                    <Image
                      source={{ uri: entry.image_url }}
                      style={styles.entryImage}
                    />
                  )}
                  <View style={styles.entryDetails}>
                    <View style={styles.entryHeader}>
                      <View style={styles.mealTypeContainer}>
                        <Ionicons 
                          name={getMealTypeIcon(entry.meal_type)} 
                          size={20} 
                          color="#00ff9d" 
                        />
                        <Text style={styles.mealTypeText}>
                          {entry.meal_type ? entry.meal_type.charAt(0).toUpperCase() + entry.meal_type.slice(1) : 'Meal'}
                        </Text>
                      </View>
                      <Text style={styles.entryDate}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <Text style={styles.entryDescription}>{entry.description}</Text>
                    
                    <Text style={styles.entryNutrition}>
                      {Math.round(entry.calories || 0)} cal • {Math.round(entry.protein || 0)}g protein • {Math.round(entry.carbs || 0)}g carbs • {Math.round(entry.fat || 0)}g fat
                    </Text>
                    
                    {entry.notes && (
                      <Text style={styles.entryNotes}>
                        {entry.notes}
                      </Text>
                    )}
                  </View>
                </View>
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Undo Snackbar */}
      {showUndo && (
        <View style={styles.undoContainer}>
          <Text style={styles.undoText}>Entry deleted</Text>
          <TouchableOpacity onPress={undoDelete} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  logoutButton: {
    padding: 8,
    marginTop: 8,
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeText: {
    color: '#00ff9d',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  swipeHint: {
    color: '#888',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  undoText: {
    color: 'white',
    fontSize: 16,
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  undoButtonText: {
    color: '#00ff9d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  entryNotes: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
}); 