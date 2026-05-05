# 🌊 OneFlow (FlowOps)

> **Workflow-Aligned Mobile Integration Layer for Indian MSMEs**

OneFlow is a Progressive Web Application (PWA) designed to bridge the digital gap for micro, small, and medium enterprises (MSMEs) in India. Built specifically to handle unstable network conditions and non-technical staff, OneFlow provides a lightning-fast, offline-capable interface for inventory management, digital ledger (Khata), and billing operations.

![OneFlow UI Preview](https://flowops-pi.vercel.app/icon-512.png)

## ✨ Core Features

* **📦 Smart Inventory Management**: Real-time stock tracking with low-stock alerts, fast editing, and unified categorization.
* **📒 Digital Khata (Ledger)**: Track customer credits and dues seamlessly. Replace paper ledgers with a searchable, digital equivalent.
* **🧾 Rapid Billing (Rush Mode)**: Optimized for high-traffic environments, allowing cashiers to generate bills with minimal taps.
* **📶 Offline-First Architecture**: Built as a PWA with Firebase v10 persistent local caching. The app works perfectly during internet outages and synchronizes automatically when the connection is restored.
* **📱 Native Mobile Experience**: Installable directly from the browser to the home screen (no App Store/Play Store required).

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS
* **Backend/Database**: Firebase (Firestore, Authentication)
* **Icons**: Lucide React
* **Deployment**: Vercel
* **Architecture**: Offline-First Progressive Web App (PWA)

## 🚀 Live Demo

**[Launch OneFlow App](https://flowops-pi.vercel.app/)**

*(Best experienced on a mobile device. Open the link in Chrome/Safari and select "Add to Home Screen" to install it as a native app).*

## 💻 Local Development

### Prerequisites
* Node.js (v18+)
* NPM or Yarn

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flowops.git
   cd flowops
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Deployment

The application is configured for seamless deployment on Vercel. PWA caching and routing are handled via the `vercel.json` configuration and `public/sw.js` Service Worker.

## 📄 License
MIT
