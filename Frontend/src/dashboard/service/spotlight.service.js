import dashboardAxiosClient from "../config/axios.config";

export async function getAllDashboardSpotlights() {
  try {
    const res = await dashboardAxiosClient.get("/spotlight");
    return res.data;
  } catch (error) {
    console.error("Error in getAllDashboardSpotlights:", error);
    throw error;
  }
}

export async function createSpotlight(formData) {
  try {
    const res = await dashboardAxiosClient.post("/spotlight", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error in createSpotlight:", error);
    throw error;
  }
}

export async function updateSpotlight(id, formData) {
  try {
    const res = await dashboardAxiosClient.put(`/spotlight/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error in updateSpotlight:", error);
    throw error;
  }
}

export async function deleteSpotlight(id) {
  try {
    const res = await dashboardAxiosClient.delete(`/spotlight/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error in deleteSpotlight:", error);
    throw error;
  }
}
