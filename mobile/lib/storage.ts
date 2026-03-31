import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const setItem = async (key: string, value: string) => {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      // Fallback for native if SecureStore fails (e.g. no hardware support)
      await AsyncStorage.setItem(key, value);
    }
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return await AsyncStorage.getItem(key);
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return await AsyncStorage.getItem(key);
    }
  }
};

export const removeItem = async (key: string) => {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      await AsyncStorage.removeItem(key);
    }
  }
};

export default {
  setItem,
  getItem,
  removeItem,
};
