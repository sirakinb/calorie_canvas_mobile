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
    console.log('Loading image from URI:', uri);
    
    // Check if URI exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    console.log('File exists:', fileInfo.exists);
    console.log('File info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error(`File does not exist at path: ${uri}`);
    }
    
    // Remove the 'file://' prefix if it exists
    const cleanUri = uri.replace('file://', '');
    
    // Read the file as base64
    console.log('Reading file as base64...');
    const base64 = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('Base64 encoding successful, length:', base64.length);
    
    return base64;
  } catch (error: any) {
    console.error('Detailed error loading image:', error);
    throw new Error(`Failed to load image data: ${error.message || 'Unknown error'}`);
  }
}

export async function identifyFoodFromImage(imageUri: string, description?: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    console.log('Starting food identification from image');
    console.log('API Key exists:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    console.log('Image URI:', imageUri);
    
    try {
      // Initialize the model with Gemini 2.0 Flash
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('Loading image as base64...');
      const imageData = await loadImageAsBase64(imageUri);
      console.log('Image loaded successfully, length:', imageData.length);
      
      // Prepare the prompt
      const prompt = description 
        ? `Analyze this food/beverage image and description: "${description}". 
           Provide a clear, concise description of just the food items.`
        : `Analyze this food/beverage image. 
           Provide a clear, concise description of just the food items.`;
      
      console.log('Preparing to call Gemini API with prompt:', prompt);
      console.log('Model being used:', 'gemini-2.0-flash');

      // Generate content with proper image data structure
      console.log('Calling Gemini API...');
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);
      console.log('Gemini API call successful');
      
      const response = await result.response;
      const text = response.text();
      console.log('Received response text:', text);

      // Parse the response into a simple description
      return {
        description: text.trim(),
        ingredients: [] // We'll let the nutrition API handle ingredients
      };
    } catch (innerError) {
      console.error('Inner error in food identification:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('Error in food identification:', error);
    throw new Error('Failed to identify food in image. Please try again.');
  }
}

export async function identifyFoodFromText(description: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Analyze this food/beverage description: "${description}". 
                   Provide a clear, concise description of just the food items.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      description: text.trim(),
      ingredients: [] // We'll let the nutrition API handle ingredients
    };
  } catch (error) {
    console.error('Error in food identification from text:', error);
    throw new Error('Failed to identify food from description. Please try again.');
  }
}

export async function getNutritionEstimate(foodDescription: string): Promise<NutritionEstimate | null> {
  try {
    // Initialize the model with Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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