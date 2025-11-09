const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
};

console.log('🔧 Config loaded:');
console.log('  📍 API URL:', config.apiUrl);
console.log('  🌍 ENV:', process.env.EXPO_PUBLIC_API_URL);

export default config;