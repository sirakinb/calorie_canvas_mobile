import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';

interface NutritionEntry {
  id: string;
  date: Date;
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
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.newEntry) {
      try {
        const newEntry = JSON.parse(params.newEntry as string);
        setNutritionEntries(prev => [newEntry, ...prev]);
        updateDailyTotals(newEntry.nutrition);
      } catch (error) {
        console.error('Error parsing new entry:', error);
      }
    }
  }, [params.newEntry]);

  const updateDailyTotals = (nutrition: NutritionEntry['nutrition']) => {
    setDailyTotals(prev => ({
      calories: (prev.calories || 0) + (nutrition.calories || 0),
      protein: (prev.protein || 0) + (nutrition.protein || 0),
      carbs: (prev.carbs || 0) + (nutrition.carbs || 0),
      fat: (prev.fat || 0) + (nutrition.fat || 0),
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.logo}>CalorieCanvas</Text>
        <Text style={styles.tagline}>Track your nutrition with precision</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Daily Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.fat}g</Text>
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
              <View key={entry.id} style={styles.entryCard}>
                {entry.imageUri && (
                  <Image
                    source={{ uri: entry.imageUri }}
                    style={styles.entryImage}
                  />
                )}
                <View style={styles.entryDetails}>
                  <Text style={styles.entryDescription}>{entry.description}</Text>
                  <Text style={styles.entryNutrition}>
                    {entry.nutrition.calories} cal • {entry.nutrition.protein}g protein
                  </Text>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
}); 