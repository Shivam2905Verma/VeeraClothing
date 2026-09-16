import dashboardAxiosClient from "../config/axios.config";

export async function getCategories() {
  const res = await dashboardAxiosClient.get("/categories");
  return res.data;
}
