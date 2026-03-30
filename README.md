<div align="center">
  <img src="https://raw.githubusercontent.com/shiva-bajpai/vibe/main/public/logo.png" alt="Vibe Logo" width="120" />
  
  # 🎵 Vibe
  ### A Minimal, Distraction-Free YouTube Music Streaming Platform

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

  *Listen to your favorite YouTube music peacefully. No video, no ads, just pure audio.*
</div>

---

## 📖 About Vibe

**Vibe** is a high-performance, open-source streaming alternative designed for users who love music but hate the cluttered, ad-heavy experience of modern video platforms. By stripping away the video feed and focusing purely on the audio, Vibe offers a lightweight, distraction-free environment that saves bandwidth and battery.

Whether you're deeply focused on work, studying, or just relaxing, Vibe lets you search for any track, import your favorite YouTube playlists, and seamlessly manage your queue without interruptions. 

> **Note**: This project was developed as a submission for the 6-Month Cloud Open Source Software (OSS) Program.

---

## ✨ Key Features

- **🚫 Zero Ads, Zero Distractions**: A completely ad-free audio streaming experience.
- **🎧 Audio-Only Streaming**: Saves tremendous amounts of internet bandwidth by extracting and playing only the audio stream, skipping heavy video rendering.
- **🔍 Smart Search & Playlists**: Instantly search for any YouTube track or paste an existing YouTube playlist URL to import your curated library.
- **📱 PWA & Offline Ready**: Fully installable Progressive Web App (PWA). Add it to your home screen for a native app-like experience.
- **✨ Fluid UI & Animations**: Built with Framer Motion for buttery-smooth transitions and a highly reactive interface.
- **🗂️ Drag & Drop Queue**: Intuitively reorder your playlist queue using robust drag-and-drop mechanics.

---

## 🛠️ Technology Stack

Vibe is built with a modern, cutting-edge frontend ecosystem to ensure peak performance and maintainability:

- **Core Framework**: React 19 (Hooks, Suspense, Concurrent rendering)
- **Build Tool**: Vite (Lightning fast HMR and optimized builds)
- **Routing**: React Router DOM (v7)
- **Animations**: Framer Motion
- **Interactions**: @dnd-kit for accessible drag-and-drop
- **PWA Capabilities**: vite-plugin-pwa for service workers and manifest generation
- **State/Notifications**: React Hot Toast

---

## 🚀 Getting Started

To run Vibe locally on your machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vibe.git
   cd vibe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:5173` in your browser.

---

## 🏗️ Architecture & Philosophy

Vibe follows a strict component-driven architecture, ensuring maximum reusability and isolated testing. The goal is to provide an Enterprise-grade frontend structure while maintaining the simplicity needed for open-source contributors to easily jump in.

- **Minimalist Design**: Every UI element serves a purpose. No hidden menus, no unnecessary popups.
- **Client-Side Processing**: Heavy lifting is optimized on the client side, ensuring low server overhead and fast response times.

---

## 🤝 Contributing

We welcome contributions from everyone! Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please make sure to update tests as appropriate.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by music lovers, for music lovers.
</div>
