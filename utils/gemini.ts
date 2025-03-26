import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);

export async function analyzeImage(imageBase64: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const prompt = "Analyze this food image and provide a detailed description including the type of food, estimated quantity, and any notable characteristics. Be specific about the number of items if multiple items are present.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export async function analyzeImageWithDescription(
  imageBase64: string,
  description: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const prompt = `Analyze this food image with the following user description: "${description}". 
    Provide a detailed response including:
    1. Confirmation or correction of the user's description
    2. Specific quantity of food items
    3. Any additional details about the food's appearance
    Be very specific about quantities, especially for multiple items.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image with description:', error);
    throw error;
  }
}

export default {
  analyzeImage,
  analyzeImageWithDescription,
  // Add any other functions you want to export
}; 