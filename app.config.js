export default {
  expo: {
    name: "CalorieCanvas",
    slug: "calorie-canvas-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a1a"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.caloriecanvas.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "This app uses the camera to take photos of your meals for nutrition analysis.",
        NSPhotoLibraryUsageDescription: "This app accesses your photos to analyze meals for nutritional content.",
        ITSAppUsesNonExemptEncryption: false,
        UIRequiresFullScreen: true,
        LSApplicationQueriesSchemes: [
          "caloriecanvas",
          "exp",
          "expo"
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a1a1a"
      },
      package: "com.caloriecanvas.app",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      EXPO_PUBLIC_SUPERWALL_API_KEY_IOS: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS,
      EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID,
      EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      EXPO_PUBLIC_SPOONACULAR_API_KEY: process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY,
      eas: {
        projectId: "4af3c385-b074-43af-b0b8-6ad24c5171a6"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: "The app needs access to your photos to analyze meal nutrition.",
          cameraPermission: "The app needs access to your camera to take photos of meals."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow CalorieCanvas to access your camera to take photos of meals."
        }
      ],
      "expo-font"
    ],
    scheme: "caloriecanvas",
    development: {
      suppressAssetValidation: true
    }
  }
} 