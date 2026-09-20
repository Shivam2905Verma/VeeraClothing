import dashboardAxiosClient from "../config/axios.config";

export async function getAllDashboardOrders() {
  try {
    const res = await dashboardAxiosClient.get("/order");
    return res.data;
  } catch (error) {
    console.error("Error in getAllDashboardOrders:", error);
    throw error;
  }
}

export async function getDashboardOrderById(id) {
  try {
    const res = await dashboardAxiosClient.get(`/order/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error in getDashboardOrderById:", error);
    throw error;
  }
}

export async function updateDashboardOrderStatus(id, data) {
  try {
    const res = await dashboardAxiosClient.patch(`/order/${id}/status`, data);
    return res.data;
  } catch (error) {
    console.error("Error in updateDashboardOrderStatus:", error);
    throw error;
  }
}
