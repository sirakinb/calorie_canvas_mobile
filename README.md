# CalorieCanvas Mobile

A React Native mobile app that uses AI to analyze food and provide nutritional information. Built with Expo and OpenAI's GPT-4 Vision.

## Features

- 📸 Take photos or upload images of food
- 💬 Describe meals in text
- 🧮 Get detailed nutritional analysis
- 📊 Track daily nutrition intake
- 🎨 Beautiful, modern UI

## Tech Stack

- React Native with Expo
- TypeScript
- OpenAI GPT-4 and GPT-4 Vision
- Expo Router for navigation
- Superwall for monetization

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

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
  - OpenAI Project API key
  - Superwall API keys (iOS/Android)

4. Start the development server:
```bash
npx expo start
```

5. Run on your device:
- Scan the QR code with Expo Go (Android)
- Press 'i' for iOS Simulator
- Press 'a' for Android Emulator

## Environment Variables

Required environment variables:
- `EXPO_PUBLIC_OPENAI_API_KEY`: Your OpenAI project API key
- `EXPO_PUBLIC_SUPERWALL_API_KEY_IOS`: Superwall iOS API key
- `EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID`: Superwall Android API key

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
