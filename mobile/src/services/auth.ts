import * as SecureStore from "expo-secure-store";
import { api } from "./api";

const TOKEN_KEY = "agrotools_token";

export async function register(data: {
  fullName: string;
  email: string;
  cpf: string;
  password: string;
  phone?: string;
}) {
  const res = await api.post("/auth/register", data);
  return res.data as { accessToken: string };
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  return res.data as { accessToken: string };
}

export async function saveToken(token: string) {
  if (!token) throw new Error("Token vazio");
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}
