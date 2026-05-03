/**
 * Centralized Application Configuration
 * Handles logic for both Client (Vite) and Server environments
 */

const isServer = typeof window === 'undefined';

export const CONFIG = {
  APP_NAME: 'Election AI',
  VERSION: '1.0.0',
  ENV: (isServer ? process.env.NODE_ENV : (import.meta.env.VITE_ENV || 'development')),
  
  API: {
    GEMINI_KEY: isServer 
      ? process.env.GEMINI_API_KEY 
      : (import.meta.env.VITE_GEMINI_API_KEY || ''),
    MAPS_KEY: isServer
      ? process.env.MAPS_API_KEY
      : (import.meta.env.VITE_MAPS_API_KEY || ''),
    BASE_URL: isServer
      ? (process.env.APP_URL || 'http://localhost:3000')
      : (import.meta.env.VITE_APP_URL || 'http://localhost:3000'),
  },

  FEATURES: {
    ENABLE_AI_TUTOR: true,
    ENABLE_REALTIME_UPDATES: false,
  }
};

export default CONFIG;
