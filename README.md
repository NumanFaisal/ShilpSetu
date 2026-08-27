# 🎨 ShilpSetu AI — Empowering Indian Artisans through AI & E-Commerce

[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-black?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://www.nativewind.dev/)
[![Offline First](https://img.shields.io/badge/Offline%20First-AsyncStorage%20%2B%20Zustand-green?style=for-the-badge)](#-offline-first-architecture)

**ShilpSetu AI** (*"Bridge of Craft"*) is a modern, AI-powered mobile e-commerce platform designed to bridge traditional Indian artisans with retail buyers, global markets, and bulk corporate purchasers. 

Built on **Expo SDK 57** and **React Native**, ShilpSetu enables rural craftspeople to digitize, price, and sell handmade goods using **multilingual voice and vision AI**, even in low-connectivity environments.

---

## 🌟 Key Features

### 🛠️ For Artisans
- **🎙️ Voice & Camera Product Digitization**: Snap a photo and record a voice note in regional languages (Hindi, Bengali, Tamil, etc.). AI generates titles, rich cultural descriptions, suggested pricing, and categorizations automatically.
- **📊 AI Pricing & Market Intelligence**: Recommends competitive pricing based on material costs, labor hours, historical demand, and market trends.
- **🤖 Multilingual AI Craft Assistant**: 24/7 AI chatbot guiding artisans on shipping, raw material sourcing, bulk order negotiation, and market insights.
- **📦 Bulk Bidding & Corporate Requests**: View and submit quotes for large custom orders requested by bulk buyers.
- **🌐 Offline-First Queue**: Add products, track orders, and send messages without internet connectivity. Changes automatically sync when back online.

### 🛍️ For Buyers & Corporate Procurement
- **✨ Authentic Craft Discovery**: Explore curated handcrafted collections across pottery, handloom, woodwork, brassware, and traditional paintings.
- **📜 Artisan Storytelling**: Discover the heritage, master craftsman profiles, and geographic origin of every item.
- **🤝 Custom Bulk Requests**: Post custom procurement requests for events, corporate gifting, or wholesale retail.
- **💬 Direct Artisan Messaging**: Real-time messaging with artisans to customize products, discuss delivery timelines, and approve samples.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) (React Native 0.86.3, Expo Router v4) |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS 3.4) |
| **State & Offline Storage** | [Zustand v5](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage` |
| **Connectivity Tracking** | `@react-native-community/netinfo` |
| **Icons & Media** | `lucide-react-native`, `expo-image-picker`, `expo-camera`, `expo-av` |
| **Animations** | `react-native-reanimated` |
| **Native Build Tools** | Android NDK 26b (`26.1.10909125`), CMake 3.22.1, Gradle 8.13 |

---

## 📋 System Requirements & Prerequisites

Before setting up ShilpSetu AI on your system, ensure you have the following installed:

1. **Node.js**: `v18.x` or `v20.x` (LTS recommended)
2. **Package Manager**: `npm` (v9+) or `pnpm`
3. **Android Development Tools** (for Native Android builds):
   - **Android Studio**: Jellyfish / Koala or newer
   - **Android SDK**: API Level 34 / 36 (`compileSdkVersion 36`)
   - **Android NDK**: Version `26.1.10909125` (NDK 26b)
   - **CMake**: `3.22.1` or newer
   - **Java Development Kit (JDK)**: JDK 17 (recommended for Gradle 8/9 compatibility)

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/NumanFaisal/ShilpSetu.git
cd ShilpSetu
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Expo Development Server
```bash
npx expo start
```
- Press `a` to launch on a connected Android device or emulator.
- Press `w` to run in a web browser.
- Scan the QR code with the **Expo Go** app on iOS/Android.

---

## 📱 Native Android Setup & Build Instructions

To build a standalone APK or run directly on an Android device/emulator with full C++ native module support:

### 1. Set Up `local.properties`
Create or update `android/local.properties` with your local Android SDK and NDK paths:
```ini
sdk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
ndk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk\\ndk\\26.1.10909125
```
*(On macOS/Linux, adjust paths accordingly, e.g. `/Users/<YourUsername>/Library/Android/sdk`)*

### 2. Regenerate Native Projects (Expo Prebuild)
```bash
npx expo prebuild
```

### 3. Build Debug APK
Run the assembleDebug task using Gradle:
```bash
cd android
.\gradlew.bat assembleDebug -x lint -x test
```
*(On macOS/Linux: `./gradlew assembleDebug -x lint -x test`)*

The generated APK will be available at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📁 Directory Structure

```
ShilpSetu/
├── app/                      # Expo Router File-Based Navigation & Screens
│   ├── (artisan)/            # Artisan Dashboard, Inventory, Bids, & Analytics
│   ├── (artisan-flow)/       # AI Product Camera, Voice Digitization & Pricing
│   ├── (artisan-onboarding)/ # Craft registration & profile builder
│   ├── (auth)/               # Mobile OTP & Role Selection
│   ├── (buyer)/              # Discovery Feed, Product Detail, Cart & Checkout
│   ├── chat/                 # Direct Artisan-Buyer Messaging & AI Assistant
│   ├── _layout.tsx           # Global Root Navigation & Font Provider
│   └── settings.tsx          # App Settings & Language Selector
├── components/               # Reusable UI Components & Modals
├── store/                    # Zustand State Stores
│   └── useAppStore.ts        # Global App State, Role, Persistence & Offline Queue
├── services/                 # API Client & Mock AI Services
│   └── api.ts                # Voice, Vision, Pricing & Catalog Backend Layer
├── mocks/                    # Seed Data for Artisans, Buyers, Products & Requests
│   └── seed.ts               # Sample product listings, craft categories & chats
├── assets/                   # App Icons, Splash Screen & Graphics
├── android/                  # Generated Android Native Project
└── app.json                  # Expo Configuration Schema
```

---

## 📶 Offline-First Architecture

ShilpSetu AI is engineered for low-bandwidth rural environments:
- **Zustand Persistence**: All store data (user profile, offline queue, drafts, cart) is automatically saved to device storage via `@react-native-async-storage/async-storage`.
- **NetInfo Listener**: Real-time network listener (`@react-native-community/netinfo`) detects internet connection restoration and processes queued items automatically.
- **Optimistic UI Updates**: User actions (creating listings, placing bids, sending messages) update the UI instantly while scheduling sync tasks in the background.

---

## 🛠️ Common Build & Troubleshooting Tips

### 1. Missing NDK Error
If Gradle throws an NDK version mismatch error:
- Open **Android Studio** > **SDK Manager** > **SDK Tools** > Check **Show Package Details** > Install **NDK (Side by side) 26.1.10909125**.
- Ensure `ext.ndkVersion = "26.1.10909125"` is set in `android/build.gradle` and `android.ndkVersion=26.1.10909125` in `android/gradle.properties`.

### 2. Native C++ Linking / CMake Error
Ensure `-std=c++20` is included in `android/app/build.gradle` under `externalNativeBuild.cmake`:
```groovy
externalNativeBuild {
    cmake {
        cppFlags "-std=c++20"
        arguments "-DANDROID_STL=c++_shared"
    }
}
```

### 3. Clear Cache
If dependencies or Metro bundler get out of sync:
```bash
npx expo start -c
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p center="align">
  Crafted with ❤️ for Indian Artisans & Craft Communities
</p>
