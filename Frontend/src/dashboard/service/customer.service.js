import dashboardAxiosClient from "../config/axios.config";

export async function getAllDashboardCustomers(params = {}) {
  try {
    const res = await dashboardAxiosClient.get("/customer", { params });
    return res.data;
  } catch (error) {
    console.error("Error in getAllDashboardCustomers:", error);
    throw error;
  }
}
