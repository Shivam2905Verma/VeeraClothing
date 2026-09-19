import axiosClient from "../config/axios.config";

export async function getMeasurementOfCategories(categoryIds) {
  try {
    const res = await axiosClient.post(`/measurement`, { categoryIds });
    return res.data;
  } catch (error) {
    console.error("Error in getMeasurementOfCategories:", error);
    throw error;
  }
}
