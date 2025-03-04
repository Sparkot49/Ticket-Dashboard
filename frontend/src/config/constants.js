// URL de l'API backend
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configuration Discord
export const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
export const DISCORD_REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI || `${window.location.origin}/login`;