import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// Debug: Log environment variables
console.log('Environment variables:', {
  fromProcess: process.env.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0, 10),
  fromConstants: (Constants as any).expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0, 10)
});

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
console.log('API Key length:', API_KEY?.length);

if (!API_KEY) {
  throw new Error('OpenAI API key not found in environment variables');
}

// Initialize OpenAI client with project API key configuration
const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.openai.com/v1", // Explicitly set API version
});

// Log OpenAI client configuration
console.log('OpenAI client initialized with configuration:', {
  hasApiKey: !!openai.apiKey,
  apiKeyLength: openai.apiKey?.length,
});

interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

async function fileToBase64(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.error('Error reading image file:', error);
    throw new Error('Failed to process image file');
  }
}

export async function analyzeNutrition(imageUri: string | null, userDescription?: string): Promise<NutritionAnalysis> {
  try {
    if (!imageUri && !userDescription) {
      throw new Error('Either image or description must be provided');
    }

    const systemPrompt = `You are a nutrition expert that analyzes food and provides detailed nutritional information. 
    Always respond with a JSON object containing calories, protein, carbs, fat, and a description.`;

    const userPrompt = `${imageUri ? 'Analyze this food image' : ''} ${userDescription ? 'and analyze this description: ' + userDescription : ''}.
    Provide a detailed nutritional analysis with the following information:
    1. Estimated calories
    2. Protein content in grams
    3. Carbohydrate content in grams
    4. Fat content in grams
    5. A brief description of the food items

    Format your response as a JSON object with these exact keys:
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "description": "string"
    }`;

    let response;
    
    if (imageUri) {
      // Use GPT-4 Vision for image analysis
      const base64Image = await fileToBase64(imageUri);
      
      response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      });
    } else {
      // Use GPT-4 for text-only analysis
      response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 500,
      });
    }

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No response from OpenAI");
    }

    console.log('API Response text:', text);

    // Extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('API Response:', text);
      throw new Error("Failed to parse nutrition data from API response");
    }
    
    try {
      const nutritionData = JSON.parse(jsonMatch[0]);
      
      // Validate the response has all required fields
      if (!nutritionData.calories || !nutritionData.protein || 
          !nutritionData.carbs || !nutritionData.fat || !nutritionData.description) {
        console.error('Incomplete nutrition data:', nutritionData);
        throw new Error("Incomplete nutrition data from API response");
      }

      return nutritionData;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse nutrition data');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error instanceof Error ? error : new Error('Failed to analyze nutrition data');
  }
} 