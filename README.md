# Election AI - Digital Voter Service Portal

An advanced AI-powered pilot system for Indian electoral literacy and digital service integration. This project is designed to help voters understand the election process through AI engagement, simulations, and eligibility verification.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
# Clone the repository (if applicable) or unzip the project
cd election-ai

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` and provide your API keys.

```bash
cp .env.example .env
```

**Required Environment Variables:**
- `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.
- `VITE_APP_URL`: Base URL of the app (default: http://localhost:3000).

### 4. Running the Project

#### Development Mode
Runs both the Express backend and the Vite frontend with HMR.
```bash
npm run dev
```

#### Production Build
Build the project for production.
```bash
npm run build
```

#### Production Start
Run the built project.
```bash
npm run start
```

## 📁 Project Structure

```bash
election-ai/
├── src/
│   ├── assets/       # Static assets (images, icons)
│   ├── components/   # Reusable UI components
│   ├── config/       # Centralized app configuration
│   ├── context/      # React context (Settings, Identity)
│   ├── hooks/        # Custom React hooks
│   ├── i18n/         # Internationalization (English, Hindi, Telugu)
│   ├── pages/        # Route-level page components
│   ├── services/     # Firebase, Gemini, and external API services
│   ├── utils/        # Helper functions & storage utilities
│   ├── App.tsx       # Main application routing
│   └── main.tsx      # Entry point
├── server.ts         # Express backend (API & static serving)
├── .env.example      # Environment template
└── README.md         # This file
```

## 🛠 Features
- **AI Election Tutor**: Real-time Q&A regarding the Indian voting process.
- **Poll Simulator 2.0**: Step-by-step simulation of the booth experience (Inking, EVM, VVPAT).
- **Voter IQ Quiz**: Multilingual gamified testing of electoral literacy.
- **Constituency Lookup**: Find your designated polling booth by pincode.
- **Identity Management**: Education on Form 6 and identity verification documents.
- **Multilingual Support**: Fully localized in English, Hindi, and Telugu.

## ⚠️ Troubleshooting

### Gemini API Error
If the chat assistant fails, ensure your `VITE_GEMINI_API_KEY` is correctly set in `.env` and associated with a project in Google AI Studio.

### Firebase Connection
This project uses Firebase for secondary progress persistence. Ensure your `firebase-applet-config.json` is present in the root directory if using Firebase features.

### Port Conflicts
By default, the server runs on port **3000**. If this port is occupied, change the `PORT` constant in `server.ts`.

## 📜 License
Educational Pilot Project - Licensed under MIT.
