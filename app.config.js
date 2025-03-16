module.exports = {
  expo: {
    name: "CalorieCanvas",
    slug: "calorie-canvas-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.caloriecanvas.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.caloriecanvas.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      EXPO_PUBLIC_SUPERWALL_API_KEY_IOS: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS,
      EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID,
    },
    plugins: [
      "expo-router"
    ],
    scheme: "expo-app-boilerplate"
  }
} 