import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveBaseURL(): string {
  const envUrl = (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl;

  const extra = (Constants?.expoConfig?.extra as any) || {};
  if (extra.API_BASE_URL) return extra.API_BASE_URL;

  const hostUri = Constants?.expoConfig?.hostUri ?? "";
  if (hostUri) {
    const host = hostUri.split(":")[0];

    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return `http://${host}:3333`;
    }
  }

  if (Platform.OS === "android") return "http://10.0.2.2:3333";
  return "http://localhost:3333";
}

export const API_BASE_URL = resolveBaseURL();
console.log("API_BASE_URL =>", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});
