import dashboardAxiosClient from "../config/axios.config";

export async function getMeasurements() {
  try {
    const res = await dashboardAxiosClient.get("/measurement");
    return res.data;
  } catch (error) {
    console.error("Error in getMeasurements service:", error);
    throw error;
  }
}

export async function createMeasurement({ name, unit }) {
  try {
    const res = await dashboardAxiosClient.post("/measurement/create", {
      name,
      unit,
    });
    return res.data;
  } catch (error) {
    console.error("Error in createMeasurement service:", error);
    throw error;
  }
}

export async function updateMeasurement(id, { name, unit }) {
  try {
    const res = await dashboardAxiosClient.put(`/measurement/update/${id}`, {
      name,
      unit,
    });
    return res.data;
  } catch (error) {
    console.error("Error in updateMeasurement service:", error);
    throw error;
  }
}

export async function deleteMeasurement(id) {
  try {
    const res = await dashboardAxiosClient.delete(`/measurement/delete/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error in deleteMeasurement service:", error);
    throw error;
  }
}
