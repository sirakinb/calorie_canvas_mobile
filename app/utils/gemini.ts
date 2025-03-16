import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  healthTips: string[];
}

export async function analyzeNutrition(imageUri: string, description: string): Promise<NutritionAnalysis> {
  try {
    // Get the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Convert image URI to base64
    const imageResponse = await fetch(imageUri);
    const blob = await imageResponse.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Prepare the prompt
    const prompt = `Analyze this meal image and description: "${description}". 
    Provide a detailed nutritional analysis including:
    1. Estimated calories
    2. Macronutrients (protein, carbs, fat in grams)
    3. List of main ingredients
    4. Health tips or suggestions
    
    Format the response as a JSON object with these keys:
    {
      calories: number,
      protein: number,
      carbs: number,
      fat: number,
      ingredients: string[],
      healthTips: string[]
    }`;

    // Generate content
    const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: 'image/jpeg' } }]);
    const generatedResponse = await result.response;
    const text = generatedResponse.text();

    // Parse the JSON response
    return JSON.parse(text) as NutritionAnalysis;
  } catch (error) {
    console.error('Error analyzing nutrition:', error);
    throw new Error('Failed to analyze nutrition. Please try again.');
  }
} 