import { api } from "./api";

export async function searchEquipments(params: {
  city: string;
  type?: "colheitadeira" | "trator" | "pulverizador" | "plantadeira";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}) {
  const res = await api.get("/equipments/search", { params });
  return res.data as {
    data: any[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getEquipmentDetail(id: string) {
  const res = await api.get(`/equipments/${id}`);
  return res.data as any; // contém owner_phone e photos
}
