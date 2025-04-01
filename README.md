# Calorie Canvas Mobile

A React Native mobile app that uses AI to analyze food and provide nutritional information. Built with Expo, Google's Gemini AI, and Spoonacular API.

## Features

- 📸 Take photos or upload images of food
- 💬 Describe meals in text
- 🧮 Get detailed nutritional analysis
- 📊 Track daily nutrition intake
- 🎨 Beautiful, modern UI
- 🔄 Offline support
- 👤 User authentication with Supabase
- 🗑️ Swipe-to-delete with undo
- 📱 Cross-platform (iOS/Android)

## Tech Stack

- React Native with Expo
- TypeScript
- Google's Gemini AI for image and text analysis
- Spoonacular API for nutritional data
- Supabase for authentication and data storage
- Expo Router for navigation
- React Native Reanimated for animations
- Expo Image Manipulator for image processing

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Supabase account
- Google Cloud account (for Gemini AI)
- Spoonacular account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/calorie_canvas_mobile.git
cd calorie_canvas_mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Fill in your API keys:
  - Google Cloud API key (for Gemini AI)
  - Spoonacular API key
  - Supabase URL and anon key

4. Start the development server:
```bash
npx expo start
```

5. Run on your device:
- Scan the QR code with Expo Go (Android)
- Press 'i' for iOS Simulator
- Press 'a' for Android Emulator

## Environment Variables

Required environment variables in your `.env` file:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_api_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features in Detail

### AI-Powered Food Analysis
- Uses Gemini AI to analyze food images and text descriptions
- Provides accurate food identification
- Handles complex dishes and multiple items

### Nutritional Analysis
- Spoonacular API integration for detailed nutritional data
- Fallback to AI estimation when exact matches aren't found
- Comprehensive macro and micronutrient information

### User Experience
- Clean, intuitive interface
- Dark mode design
- Haptic feedback
- Smooth animations
- Offline capability
- Undo support for deleted entries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
