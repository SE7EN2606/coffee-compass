// Determine the API base URL based on the environment
export const getApiBaseUrl = () => {
  // In development, use the local server
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, use Netlify Functions
  return '/.netlify/functions/api';
};

export const apiBaseUrl = getApiBaseUrl();