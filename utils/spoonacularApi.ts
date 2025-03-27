import axios from 'axios';
import { getNutritionEstimate } from './geminiApi';

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function searchFoodProduct(query: string): Promise<NutritionData | null> {
  try {
    const response = await axios.get(`${BASE_URL}/food/products/search`, {
      params: {
        apiKey: API_KEY,
        query,
        addNutrition: true,
        number: 1
      }
    });

    console.log('Spoonacular product search response:', response.data);

    if (response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      if (product.nutrition) {
        return {
          calories: Math.round(product.nutrition.calories || 0),
          protein: Math.round(product.nutrition.protein || 0),
          carbs: Math.round(product.nutrition.carbs || 0),
          fat: Math.round(product.nutrition.fat || 0)
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in Spoonacular product search:', error);
    return null;
  }
}

export async function searchRecipe(query: string): Promise<NutritionData | null> {
  try {
    const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
      params: {
        apiKey: API_KEY,
        query,
        addNutrition: true,
        number: 1
      }
    });

    console.log('Spoonacular recipe search response:', response.data);

    if (response.data.results && response.data.results.length > 0) {
      const recipe = response.data.results[0];
      if (recipe.nutrition) {
        const nutrients = recipe.nutrition.nutrients;
        return {
          calories: Math.round(nutrients.find((n: any) => n.name === 'Calories')?.amount || 0),
          protein: Math.round(nutrients.find((n: any) => n.name === 'Protein')?.amount || 0),
          carbs: Math.round(nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount || 0),
          fat: Math.round(nutrients.find((n: any) => n.name === 'Fat')?.amount || 0)
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in Spoonacular recipe search:', error);
    return null;
  }
}

// Main function that implements the three-tier approach
export async function getNutrition(foodDescription: string): Promise<NutritionData | null> {
  try {
    console.log('Attempting to get nutrition for:', foodDescription);
    
    // Tier 1: Try Spoonacular product database first (best for packaged/branded foods)
    const productNutrition = await searchFoodProduct(foodDescription);
    if (productNutrition) {
      console.log('Found nutrition from Spoonacular product database');
      return productNutrition;
    }

    // Tier 2: Try Spoonacular recipe database (good for common dishes/ingredients)
    const recipeNutrition = await searchRecipe(foodDescription);
    if (recipeNutrition) {
      console.log('Found nutrition from Spoonacular recipe database');
      return recipeNutrition;
    }

    // Tier 3: Use Gemini for estimation (fallback for everything else)
    console.log('No Spoonacular results found, falling back to Gemini estimation');
    return await getNutritionEstimate(foodDescription);

  } catch (error) {
    console.error('Error getting nutrition information:', error);
    return null;
  }
} 