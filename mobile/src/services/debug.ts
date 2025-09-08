import { api, API_BASE_URL } from "./api";

export async function ping() {
  try {
    const res = await api.get("/health", { timeout: 5000 });
    console.log("PING OK", API_BASE_URL, res.status, res.data);
    return true;
  } catch (e: any) {
    console.log(
      "PING FAIL",
      API_BASE_URL,
      e?.message,
      e?.response?.status,
      e?.response?.data
    );
    return false;
  }
}
