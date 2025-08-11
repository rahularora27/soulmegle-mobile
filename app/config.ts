// app/config.ts
// Configuration file for the mobile app

interface Config {
  SERVER_URL: string;
  STUN_SERVERS: string[];
  GEMINI_API_KEY?: string;
}

const DEV_CONFIG: Config = {
  // Update this with your local server IP address
  // For Android emulator: use 10.0.2.2 instead of localhost
  // For iOS simulator: use localhost or your machine's IP
  // For physical device: use your machine's IP address on the same network
  SERVER_URL: 'http://192.168.1.100:8000', // Replace with your actual IP
  STUN_SERVERS: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
  ],
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
};

const PROD_CONFIG: Config = {
  SERVER_URL: 'https://your-production-server.com', // Replace with your production URL
  STUN_SERVERS: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
  ],
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
};

const CONFIG = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

export default CONFIG;