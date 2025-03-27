import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Sex = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'moderate' | 'very';
type Goal = 'maintenance' | 'fat_loss' | 'muscle_gain';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: IconName;
}

const slides: OnboardingSlide[] = [
  {
    title: "Welcome to CalorieCanvas",
    description: "Your personal nutrition tracking companion. Let's set up your profile to get started!",
    icon: "nutrition-outline" as IconName
  },
  {
    title: "Basic Information",
    description: "Let's get to know you better to calculate your optimal nutrition needs.",
    icon: "person-outline" as IconName
  },
  {
    title: "Activity Level",
    description: "Tell us about your typical weekly activity.",
    icon: "fitness-outline" as IconName
  },
  {
    title: "Fitness Goals",
    description: "Let's set your weight management goals.",
    icon: "trophy-outline" as IconName
  }
];

interface ActivityOption {
  level: ActivityLevel;
  title: string;
  description: string;
  multiplier: number;
}

const activityOptions: ActivityOption[] = [
  {
    level: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no exercise',
    multiplier: 1.2
  },
  {
    level: 'moderate',
    title: 'Moderate',
    description: 'Exercise 1-3 times/week',
    multiplier: 1.375
  },
  {
    level: 'very',
    title: 'Very Active',
    description: 'Exercise 3-5+ times/week',
    multiplier: 1.55
  }
];

interface GoalOption {
  type: Goal;
  title: string;
  description: string;
  calorieAdjustment: number;
}

const goalOptions: GoalOption[] = [
  {
    type: 'maintenance',
    title: 'Maintain Weight',
    description: 'Keep your current weight',
    calorieAdjustment: 0
  },
  {
    type: 'fat_loss',
    title: 'Fat Loss',
    description: 'Lose 1-2 lbs per week',
    calorieAdjustment: -500
  },
  {
    type: 'muscle_gain',
    title: 'Muscle Gain',
    description: 'Gain 0.5-1 lb per week',
    calorieAdjustment: 300
  }
];

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Form state
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const calculateBMR = () => {
    const weightInLbs = parseFloat(weight);
    const heightInInches = (parseFloat(heightFt) * 12) + parseFloat(heightIn);
    const ageInYears = parseFloat(age);

    if (!weightInLbs || !heightInInches || !ageInYears || !sex) return 0;

    if (sex === 'male') {
      return 66 + (6.23 * weightInLbs) + (12.7 * heightInInches) - (6.8 * ageInYears);
    } else {
      return 655 + (4.35 * weightInLbs) + (4.7 * heightInInches) - (4.7 * ageInYears);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activity = activityOptions.find(opt => opt.level === selectedActivity);
    return bmr * (activity?.multiplier || 1.2);
  };

  const calculateDailyCalories = () => {
    const tdee = calculateTDEE();
    const goal = goalOptions.find(opt => opt.type === selectedGoal);
    const baseAdjustment = goal?.calorieAdjustment || 0;
    
    // No additional multipliers, just return the TDEE with goal adjustment
    return Math.round(tdee + baseAdjustment);
  };

  const handleComplete = async () => {
    if (!user) return;

    const dailyCalories = calculateDailyCalories();
    // Calculate macros based on calorie goal
    const proteinCalories = dailyCalories * 0.3; // 30% from protein
    const carbsCalories = dailyCalories * 0.45; // 45% from carbs
    const fatCalories = dailyCalories * 0.25; // 25% from fat

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          age: parseInt(age),
          sex: sex,
          height_ft: parseInt(heightFt),
          height_in: parseInt(heightIn),
          weight: parseInt(weight),
          daily_calorie_goal: dailyCalories,
          daily_protein_goal: Math.round(proteinCalories / 4), // 4 calories per gram of protein
          daily_carbs_goal: Math.round(carbsCalories / 4), // 4 calories per gram of carbs
          daily_fat_goal: Math.round(fatCalories / 9), // 9 calories per gram of fat
          activity_level: selectedActivity,
          fitness_goal: selectedGoal,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const renderBasicInfo = () => (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.title}>Basic Information</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.subtitle}>Sex</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.sexOption,
              sex === 'male' && styles.selectedOption
            ]}
            onPress={() => setSex('male')}
          >
            <Text style={styles.optionText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sexOption,
              sex === 'female' && styles.selectedOption
            ]}
            onPress={() => setSex('female')}
          >
            <Text style={styles.optionText}>Female</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Height</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Feet"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={heightFt}
            onChangeText={setHeightFt}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Inches"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={heightIn}
            onChangeText={setHeightIn}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Weight (lbs)"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>
    </Animated.View>
  );

  const renderActivityLevel = () => (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.title}>Activity Level</Text>
      <View style={styles.inputContainer}>
        {activityOptions.map((option) => (
          <TouchableOpacity
            key={option.level}
            style={[
              styles.activityOption,
              selectedActivity === option.level && styles.selectedActivity
            ]}
            onPress={() => setSelectedActivity(option.level)}
          >
            <Text style={[
              styles.activityTitle,
              selectedActivity === option.level && styles.selectedActivityText
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.activityDescription,
              selectedActivity === option.level && styles.selectedActivityText
            ]}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderGoals = () => (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.title}>Your Goals</Text>
      <View style={styles.inputContainer}>
        {goalOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.activityOption,
              selectedGoal === option.type && styles.selectedActivity
            ]}
            onPress={() => setSelectedGoal(option.type)}
          >
            <Text style={styles.activityTitle}>{option.title}</Text>
            <Text style={styles.activityDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}

        {selectedGoal && (
          <View style={styles.calculatedContainer}>
            <Text style={styles.calculatedTitle}>Your Daily Calorie Target</Text>
            <Text style={styles.calculatedValue}>{calculateDailyCalories()} cal</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderSlides = () => {
    return slides.map((slide, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={index}
            style={[
              styles.slide,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name={slide.icon} size={80} color="#4ADE80" />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>
        );
      } else if (index === 1) {
        return renderBasicInfo();
      } else if (index === 2) {
        return renderActivityLevel();
      } else {
        return renderGoals();
      }
    });
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentSlide(roundIndex);
  };

  const canProceed = () => {
    if (currentSlide === 1) {
      return age && sex && heightFt && heightIn && weight;
    }
    if (currentSlide === 2) {
      return selectedActivity;
    }
    if (currentSlide === 3) {
      return selectedGoal;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderSlides()}
      </ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentSlide === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
        disabled={!canProceed()}
        onPress={currentSlide === slides.length - 1 ? handleComplete : () => {
          scrollViewRef.current?.scrollTo({
            x: width * (currentSlide + 1),
            animated: true,
          });
        }}
      >
        <Text style={styles.nextButtonText}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  sexOption: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4ADE80',
    borderWidth: 1,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityOption: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedActivity: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4ADE80',
    borderWidth: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  calculatedContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  calculatedTitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  calculatedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ADE80',
    marginBottom: 8,
  },
  calculatedDetail: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4ADE80',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nextButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  activityTable: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  activityTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 12,
  },
  tableHeaderText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  activityTableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    padding: 16,
  },
  activityTableCell: {
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  selectedActivityText: {
    color: '#4ADE80',
    fontWeight: '600',
  },
}); 