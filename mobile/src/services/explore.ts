import { api } from "./api";

export async function listAll() {
  const res = await api.get("/equipments");
  return res.data as any[];
}
