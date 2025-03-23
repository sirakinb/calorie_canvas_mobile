import { EXPO_PUBLIC_SPOONACULAR_API_KEY } from '@env';

const BASE_URL = 'https://api.spoonacular.com';
const API_KEY = EXPO_PUBLIC_SPOONACULAR_API_KEY;

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ParsedIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

interface IngredientNutrition {
  nutrition: {
    nutrients: Nutrient[];
  };
}

export async function parseAndAnalyzeIngredients(ingredients: string[]): Promise<NutritionInfo> {
  try {
    // Step 1: Parse ingredients using Spoonacular's natural language processing
    const parseResponse = await fetch(
      `${BASE_URL}/recipes/parseIngredients?apiKey=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: ingredients.map(ing => `ingredientList=${encodeURIComponent(ing)}`).join('&'),
      }
    );

    if (!parseResponse.ok) {
      throw new Error(`Spoonacular API error: ${parseResponse.status}`);
    }

    const parsedIngredients: ParsedIngredient[] = await parseResponse.json();
    console.log('Parsed ingredients:', parsedIngredients);

    // Filter out only obvious non-food items
    const validIngredients = parsedIngredients.filter(ingredient => 
      ingredient.id > 0 && ingredient.name.toLowerCase() !== 'flowers'
    );

    if (validIngredients.length === 0) {
      console.warn('No valid food ingredients found');
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    // Step 2: Get nutrition information for each valid ingredient
    const nutritionPromises = validIngredients.map(ingredient =>
      fetch(
        `${BASE_URL}/food/ingredients/${ingredient.id}/information?apiKey=${API_KEY}&amount=${ingredient.amount}&unit=${ingredient.unit || 'serving'}&nutrient=calories&nutrient=protein&nutrient=carbohydrates&nutrient=fat`
      ).then(res => res.json())
    );

    const nutritionResults: IngredientNutrition[] = await Promise.all(nutritionPromises);
    console.log('Nutrition results:', nutritionResults);

    // Calculate total nutrition
    const totalNutrition = nutritionResults.reduce((acc, ingredient) => {
      if (!ingredient.nutrition?.nutrients) {
        return acc;
      }

      const nutrients = ingredient.nutrition.nutrients;
      const calories = nutrients.find(n => n.name.toLowerCase() === 'calories')?.amount || 0;
      const protein = nutrients.find(n => n.name.toLowerCase() === 'protein')?.amount || 0;
      const carbs = nutrients.find(n => n.name.toLowerCase() === 'carbohydrates')?.amount || 0;
      const fat = nutrients.find(n => n.name.toLowerCase() === 'fat')?.amount || 0;

      // Round the values to 1 decimal place
      return {
        calories: Math.round((acc.calories + calories) * 10) / 10,
        protein: Math.round((acc.protein + protein) * 10) / 10,
        carbs: Math.round((acc.carbs + carbs) * 10) / 10,
        fat: Math.round((acc.fat + fat) * 10) / 10,
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });

    return totalNutrition;
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    // Return zeros if there's an error
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }
} 