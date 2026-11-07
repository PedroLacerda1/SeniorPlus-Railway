import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Adaptador de armazenamento seguro compatível com Web, Android e iOS.
 * No ambiente Web (onde expo-secure-store não possui suporte nativo),
 * utiliza de forma transparente o localStorage.
 */
export const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (_e) {}
      return null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (_e) {
      return null;
    }
  },

  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, String(value));
        }
      } catch (_e) {}
      return;
    }

    try {
      await SecureStore.setItemAsync(key, String(value));
    } catch (_e) {}
  },

  deleteItem: async (key) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (_e) {}
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (_e) {}
  },
};

export default storage;

