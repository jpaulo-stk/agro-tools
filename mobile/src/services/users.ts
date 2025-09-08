import { api } from "./api";
import * as SecureStore from "expo-secure-store";
const TOKEN_KEY = "agrotools_token";

async function authHeader() {
  const t = await SecureStore.getItemAsync(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getMe() {
  const res = await api.get("/users/me", { headers: await authHeader() });
  return res.data as {
    id: string;
    full_name: string;
    email: string;
    cpf: string;
    phone: string | null;
  };
}

export async function patchMe(patch: {
  full_name?: string;
  phone?: string | null;
}) {
  const res = await api.patch("/users/me", patch, {
    headers: await authHeader(),
  });
  return res.data as {
    id: string;
    full_name: string;
    email: string;
    cpf: string;
    phone: string | null;
  };
}
