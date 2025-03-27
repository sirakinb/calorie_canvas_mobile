import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system';

interface FoodIdentification {
  ingredients: string[];
  description: string;
}

// Initialize the Gemini API client
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

async function loadImageAsBase64(uri: string): Promise<string> {
  try {
    // Remove the 'file://' prefix if it exists
    const cleanUri = uri.replace('file://', '');
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Error loading image:', error);
    throw new Error('Failed to load image data');
  }
}

export async function identifyFoodFromImage(imageUri: string, description?: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    // Initialize the model with Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Load image as base64
    const imageData = await loadImageAsBase64(imageUri);
    
    // Prepare the prompt
    const prompt = description 
      ? `Analyze this food/beverage image and description: "${description}". 
         Provide a clear, concise description of just the food items, including:
         - What the food/drink is
         - Quantity or size if visible
         - Key ingredients that are visible
         
         DO NOT include:
         - Cooking methods
         - Preparation details
         - Serving suggestions
         - Appearance descriptions
         
         Return ONLY a JSON object with two fields:
         1. description: Brief description of the food (e.g., "Stack of cheese quesadillas" not "Quesadillas appear to be cooked on a griddle")
         2. ingredients: Main ingredients visible
         
         Example responses:
         {"description": "Stack of cheese quesadillas with jalapeños", "ingredients": ["tortillas", "cheese", "jalapeños"]}
         {"description": "Large bowl of Mexican rice with cilantro", "ingredients": ["rice", "tomatoes", "cilantro", "spices"]}
         {"description": "Two chocolate chip cookies", "ingredients": ["cookie dough", "chocolate chips"]}`
      : `Analyze this food/beverage image. 
         Provide a clear, concise description of just the food items, including:
         - What the food/drink is
         - Quantity or size if visible
         - Key ingredients that are visible
         
         DO NOT include:
         - Cooking methods
         - Preparation details
         - Serving suggestions
         - Appearance descriptions
         
         Return ONLY a JSON object with two fields:
         1. description: Brief description of the food (e.g., "Stack of cheese quesadillas" not "Quesadillas appear to be cooked on a griddle")
         2. ingredients: Main ingredients visible
         
         Example responses:
         {"description": "Stack of cheese quesadillas with jalapeños", "ingredients": ["tortillas", "cheese", "jalapeños"]}
         {"description": "Large bowl of Mexican rice with cilantro", "ingredients": ["rice", "tomatoes", "cilantro", "spices"]}
         {"description": "Two chocolate chip cookies", "ingredients": ["cookie dough", "chocolate chips"]}`;

    // Generate content with proper image data structure
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse the response as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.description && Array.isArray(parsedResponse.ingredients)) {
          return {
            description: parsedResponse.description.trim(),
            ingredients: parsedResponse.ingredients.map((i: string) => i.trim())
          };
        }
      }
      
      // If JSON parsing fails, extract information using regex
      const lines = text.split('\n');
      let foodDescription = '';
      const ingredients: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Skip lines with formatting markers
        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('#') || 
            trimmedLine.includes('Description:') || trimmedLine.includes('Ingredients:')) {
          continue;
        }
        
        // If the line looks like an ingredient (has numbers or measurements)
        if (trimmedLine.match(/\d+|cup|tablespoon|teaspoon|pound|gram|oz|piece/i)) {
          ingredients.push(trimmedLine);
        } else {
          foodDescription = trimmedLine;
        }
      }

      return {
        description: foodDescription || "Food item",
        ingredients: ingredients.length > 0 ? ingredients : [foodDescription]
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse food identification response');
    }
  } catch (error) {
    console.error('Error in food identification:', error);
    throw new Error('Failed to identify food in image. Please try again.');
  }
}

export async function identifyFoodFromText(description: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    // Initialize the model with Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Analyze this food description: "${description}". List all ingredients with approximate quantities. Format the response as follows:
      1. First, provide a brief description of the food
      2. Then, list all ingredients with quantities`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const lines = text.split('\n');
    let foodDescription = '';
    const ingredients: string[] = [];
    let isIngredientSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Check if we're entering the ingredients section
      if (trimmedLine.toLowerCase().includes('ingredients:') || 
          trimmedLine.match(/^\d+\.\s*ingredients/i)) {
        isIngredientSection = true;
        continue;
      }
      
      if (!isIngredientSection) {
        foodDescription += trimmedLine + ' ';
      } else {
        // Clean up ingredient lines
        const ingredient = trimmedLine.replace(/^[-•*\d.)\s]+/, '').trim();
        if (ingredient) {
          ingredients.push(ingredient);
        }
      }
    }

    return {
      description: foodDescription.trim(),
      ingredients: ingredients.length > 0 ? ingredients : [foodDescription.trim()]
    };
  } catch (error) {
    console.error('Error in food identification:', error);
    throw new Error('Failed to identify food from description. Please try again.');
  }
}

export async function getNutritionEstimate(foodDescription: string): Promise<NutritionEstimate | null> {
  try {
    const prompt = `Please analyze this food/beverage item and provide its estimated nutrition facts in JSON format. Consider:
- Standard serving sizes
- Common preparation methods
- Similar items in nutrition databases
- Brand-specific nutrition if it's a branded item
- Regional or cultural variations if relevant

Food/beverage item: ${foodDescription}

For accuracy, base your estimates on reliable sources like:
- USDA Food Database
- Restaurant nutrition facts
- Packaged food labels
- Standard recipe calculations

Respond ONLY with a JSON object in this exact format:
{
  "calories": number,
  "protein": number,  // in grams
  "carbs": number,    // in grams
  "fat": number       // in grams
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in Gemini response');
        return null;
      }
      
      const nutrition = JSON.parse(jsonMatch[0]);
      
      // Validate the response has all required fields
      if (typeof nutrition.calories === 'number' &&
          typeof nutrition.protein === 'number' &&
          typeof nutrition.carbs === 'number' &&
          typeof nutrition.fat === 'number') {
        return {
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein),
          carbs: Math.round(nutrition.carbs),
          fat: Math.round(nutrition.fat)
        };
      } else {
        console.warn('Invalid nutrition data format from Gemini');
        return null;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error getting nutrition estimate from Gemini:', error);
    return null;
  }
}

// Add default export
export default {
  identifyFoodFromImage,
  identifyFoodFromText,
  getNutritionEstimate,
}; 