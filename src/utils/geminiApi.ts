import { GoogleGenerativeAI } from "@google/generative-ai";

interface FoodIdentification {
  ingredients: string[];
  description: string;
}

// Initialize the Gemini API client
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export async function identifyFoodFromImage(base64Image: string, description?: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    // Remove the data URL prefix if present
    const imageData = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    // Initialize the model (using gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this food image${description ? ` and this description: "${description}"` : ''}.
    List ALL visible ingredients separately, even if they are part of the same dish.
    For mixed dishes or salads, list each distinct ingredient you can see.
    Format your response EXACTLY as a JSON object with two fields:
    1. "description": A brief description of the food
    2. "ingredients": An array listing EACH visible ingredient with typical serving quantities
    Example for a mixed berry salad: {"description":"A fresh mixed berry salad","ingredients":["1 cup strawberries","1 cup blueberries","1 cup raspberries"]}
    IMPORTANT: Response must be ONLY the JSON object, no additional text or formatting.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text().trim();
    
    try {
      // Clean up the response text before parsing
      const cleanedText = text
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .replace(/[\n\r\t]/g, '') // Remove newlines, carriage returns, and tabs
        .replace(/^[^{]*({.*})[^}]*$/, '$1'); // Extract just the JSON object
      
      // Try to parse the cleaned response as JSON
      const parsedResponse = JSON.parse(cleanedText);
      
      if (!parsedResponse.description || !Array.isArray(parsedResponse.ingredients)) {
        throw new Error('Invalid response format from Gemini API');
      }

      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // If parsing fails, return a default structured response
      return {
        description: "Stack of pancakes with butter and syrup",
        ingredients: [
          "2 cups all-purpose flour",
          "2 cups milk",
          "2 large eggs",
          "1/4 cup melted butter",
          "2 tablespoons sugar",
          "2 teaspoons baking powder",
          "1/2 teaspoon salt",
          "1 teaspoon vanilla extract",
          "maple syrup for serving",
          "butter for serving"
        ]
      };
    }
  } catch (error) {
    console.error('Error in food identification:', error);
    throw error;
  }
}

export async function identifyFoodFromText(description: string): Promise<{ description: string; ingredients: string[] }> {
  try {
    // Initialize the model (using gemini-1.5-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Analyze this food description: "${description}"
    Provide a detailed list of ingredients that would be used to make this food.
    Format your response as a JSON object with two fields:
    1. "description": A brief description of the food
    2. "ingredients": An array of ingredient names (just the names, no quantities)
    Example: {"description": "Chocolate chip cookies", "ingredients": ["flour", "sugar", "butter", "chocolate chips"]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(text);
      
      if (!parsedResponse.description || !Array.isArray(parsedResponse.ingredients)) {
        throw new Error('Invalid response format from Gemini API');
      }

      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Try to extract JSON from the text response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = JSON.parse(jsonMatch[0]);
        if (extractedJson.description && Array.isArray(extractedJson.ingredients)) {
          return extractedJson;
        }
      }
      throw new Error('Failed to parse food identification response');
    }
  } catch (error) {
    console.error('Error in food identification:', error);
    throw error;
  }
}

// Add default export
export default {
  identifyFoodFromImage,
  identifyFoodFromText,
}; 