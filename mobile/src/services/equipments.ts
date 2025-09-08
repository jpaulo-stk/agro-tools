import { api } from "./api";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "agrotools_token";

async function authHeader() {
  const t = await SecureStore.getItemAsync(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export type EquipmentPayload = {
  type: "colheitadeira" | "trator" | "pulverizador" | "plantadeira";
  brand: string;
  model: string;
  year?: number;
  condition: string;
  price: number;
  city: string;
  state?: string;
  description?: string;
};

export async function createEquipment(
  data: EquipmentPayload,
  images: { uri: string; name?: string; type?: string }[]
) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  images.forEach((img, i) => {
    fd.append("photos", {
      uri: img.uri,
      name: img.name || `photo_${i}.jpg`,
      type: img.type || "image/jpeg",
    } as any);
  });

  const res = await api.post("/equipments", fd, {
    headers: { ...(await authHeader()), "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function listMyEquipments() {
  const res = await api.get("/equipments?mine=1", {
    headers: await authHeader(),
  });
  return res.data as any[];
}

export async function deleteEquipment(id: string) {
  await api.delete(`/equipments/${id}`, { headers: await authHeader() });
}
