import dashboardAxiosClient from "../config/axios.config";

/**
 * Fetch revenue and orders analytics for the given date range
 * @param {Object} params - { startDate, endDate }
 */
export async function getDashboardAnalytics(params = {}) {
  try {
    const res = await dashboardAxiosClient.get("/analytics", {
      params: {
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error in getDashboardAnalytics:", error);
    throw error;
  }
}

/**
 * Fetch active products, total customers, and top 10 recent orders
 */
export async function getDashboardOverview() {
  try {
    const res = await dashboardAxiosClient.get("/overview");
    return res.data;
  } catch (error) {
    console.error("Error in getDashboardOverview:", error);
    throw error;
  }
}
