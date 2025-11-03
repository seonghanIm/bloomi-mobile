import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@bloomi:accessToken',
  USER: '@bloomi:user',
};

export const storage = {
  // Access Token
  async saveAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  async removeAccessToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
  },

  // User
  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  // Clear all
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.USER]);
  },
};