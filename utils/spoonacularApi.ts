import axios from 'axios';
import { getNutritionEstimate } from './geminiApi';
import { genAI } from './genAI';

const API_KEY = '6e7f3ca2fda9414abd8f70e955d998ef';  // Using the new API key directly for now
const BASE_URL = 'https://api.spoonacular.com';

// Log the API key (masked) to verify it's loaded
console.log('Spoonacular API Key loaded:', API_KEY ? `${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}` : 'NOT SET');

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Helper function to extract key food terms
function extractFoodTerms(description: string): string {
  // Remove descriptive phrases and focus on food items
  const cleanedDesc = description
    .replace(/(?:the\s+)?(?:image\s+)?shows\s*/i, '')
    .replace(/(?:I\s+)?(?:can\s+)?see\s*/i, '')
    .replace(/(?:appears\s+to\s+be|appears|possibly|probably|seems\s+to\s+be|seems|looks\s+like)\s*/gi, '')
    .replace(/(?:what\s+)?(?:appears|looks|seems)\s+to\s+be\s*/gi, '')
    .replace(/Here's a (?:concise )?description of the food items?(?:\s*in the image)?:\s*/i, '')
    .replace(/A bowl of\s*/i, '')
    .replace(/garnished with\s*/i, '')
    .replace(/topped with\s*/i, '')
    .replace(/chopped\s*/i, '')
    .replace(/likely\s*/i, '')
    .replace(/maybe\s*/i, '')
    .replace(/perhaps\s*/i, '')
    .replace(/\s*,\s*/g, ' and ')
    .replace(/\n+/g, ' ')
    .replace(/\s+or\s+.+$/, '')  // Remove alternatives after "or"
    .trim();

  // Extract main ingredients
  const ingredients = cleanedDesc
    .split(/\s+and\s+|\s*,\s*|\s+with\s+/)
    .map(term => term.trim())
    .filter(term => term.length > 0);

  // If we detect specific dishes, prioritize them
  const specificDishes = ingredients.filter(term => {
    const lowerTerm = term.toLowerCase();
    // Look for compound dish names (e.g., "jollof rice")
    if (lowerTerm.includes('jollof') || 
        lowerTerm.includes('fried rice') ||
        lowerTerm.includes('curry') ||
        lowerTerm.includes('stew') ||
        lowerTerm.includes('soup')) {
      return true;
    }
    return false;
  });

  if (specificDishes.length > 0) {
    // Clean up the specific dish name
    return specificDishes[0]
      .toLowerCase()
      .replace(/reddish-(?:orange|brown)\s+/, '')
      .replace(/\s+rice/, ' rice')
      .trim();
  }

  // Otherwise return all ingredients joined
  return ingredients.join(' with ');
}

// Helper function to clean the query
function cleanFoodQuery(description: string): string {
  const foodTerms = extractFoodTerms(description);
  console.log('Extracted food terms:', foodTerms);
  return foodTerms;
}

async function searchFoodProduct(query: string): Promise<NutritionData | null> {
  try {
    const cleanedQuery = cleanFoodQuery(query);
    // Log the request we're about to make
    const requestUrl = `${BASE_URL}/food/products/search`;
    console.log('Making request to:', requestUrl);
    console.log('Original query:', query);
    console.log('Cleaned query:', cleanedQuery);

    // Try specific search first
    const response = await axios.get(requestUrl, {
      params: {
        apiKey: API_KEY,
        query: cleanedQuery,
        number: 1
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CalorieCanvas/1.0'
      }
    });

    // Log successful response
    console.log('Spoonacular response status:', response.status);
    console.log('Products found:', response.data.products?.length || 0);

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

    // If no results, try searching for individual ingredients
    const ingredients = cleanedQuery.split(/\s+with\s+/);
    if (ingredients.length > 1) {
      console.log('Trying individual ingredient search:', ingredients[0]);
      const ingredientResponse = await axios.get(requestUrl, {
        params: {
          apiKey: API_KEY,
          query: ingredients[0],
          number: 1
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CalorieCanvas/1.0'
        }
      });

      if (ingredientResponse.data.products && ingredientResponse.data.products.length > 0) {
        const product = ingredientResponse.data.products[0];
        if (product.nutrition) {
          return {
            calories: Math.round(product.nutrition.calories || 0),
            protein: Math.round(product.nutrition.protein || 0),
            carbs: Math.round(product.nutrition.carbs || 0),
            fat: Math.round(product.nutrition.fat || 0)
          };
        }
      }
    }

    return null;
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in Spoonacular product search:');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', error.response.data);
    }
    console.error('Error Message:', error.message);
    console.error('Request Config:', JSON.stringify(error.config, null, 2));
    return null;
  }
}

async function searchRecipe(query: string): Promise<NutritionData | null> {
  try {
    const cleanedQuery = cleanFoodQuery(query);
    // Log the request we're about to make
    const requestUrl = `${BASE_URL}/recipes/complexSearch`;
    console.log('Making request to:', requestUrl);
    console.log('Original query:', query);
    console.log('Cleaned query:', cleanedQuery);

    const response = await axios.get(requestUrl, {
      params: {
        apiKey: API_KEY,
        query: cleanedQuery,
        addNutrition: true,
        number: 1
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CalorieCanvas/1.0'
      }
    });

    // Log successful response
    console.log('Spoonacular response status:', response.status);
    console.log('Recipes found:', response.data.results?.length || 0);

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
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in Spoonacular recipe search:');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', error.response.data);
    }
    console.error('Error Message:', error.message);
    console.error('Request Config:', JSON.stringify(error.config, null, 2));
    return null;
  }
}

function getDefaultNutritionValues(): NutritionData {
  return {
    calories: 200,
    protein: 5,
    carbs: 20,
    fat: 10
  };
}

// Main function that implements the approach
export async function getNutrition(foodDescription: string, imageBase64?: string): Promise<NutritionData> {
  try {
    console.log('Starting nutrition analysis flow for:', foodDescription);
    
    // Step 1: Get initial Gemini analysis for better food identification
    let description = foodDescription;
    if (imageBase64) {
      try {
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await geminiModel.generateContent([
          'List the main food items, ingredients, and preparation method in this image. Be direct and confident in your description, without using phrases like "the image shows" or "possibly". Format: [Main dish/ingredient] with [additional ingredients/toppings].',
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg'
            }
          }
        ]);
        const geminiDescription = await result.response.text();
        description = `${foodDescription} - ${geminiDescription}`;
        console.log('Enhanced description from Gemini:', description);
      } catch (error) {
        console.error('Error getting Gemini description:', error);
        // Continue with original description if Gemini fails
      }
    }

    // Clean the description for API queries
    const cleanedDescription = cleanFoodQuery(description);
    console.log('Cleaned description for API queries:', cleanedDescription);

    if (!API_KEY) {
      console.error('Spoonacular API key not set');
      const geminiResult = await getNutritionEstimate(cleanedDescription);
      return geminiResult || getDefaultNutritionValues();
    }

    // Step 2: Try to match as a common meal in Spoonacular
    console.log('Searching for meal match in Spoonacular...');
    const recipeNutrition = await searchRecipe(cleanedDescription);
    if (recipeNutrition) {
      console.log('Found nutrition from Spoonacular recipe database');
      return recipeNutrition;
    }

    // Step 3: Try to match individual food items
    console.log('Searching for individual food items...');
    const productNutrition = await searchFoodProduct(cleanedDescription);
    if (productNutrition) {
      console.log('Found nutrition from Spoonacular product database');
      return productNutrition;
    }

    // Step 4: Fallback to Gemini for estimation
    console.log('No Spoonacular results found, using Gemini for estimation');
    const geminiResult = await getNutritionEstimate(cleanedDescription);
    if (geminiResult) {
      return geminiResult;
    }

    // Last resort - default values
    console.log('Using default nutrition values');
    return getDefaultNutritionValues();
  } catch (error) {
    console.error('Error in nutrition analysis flow:', error);
    return getDefaultNutritionValues();
  }
} 