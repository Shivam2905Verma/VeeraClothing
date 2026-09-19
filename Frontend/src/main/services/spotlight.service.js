import axiosClient from "../config/axios.config";

export async function getSpotlights() {
  try {
    const res = await axiosClient.get("/spotlight");
    return res.data;
  } catch (error) {
    console.error("Error in getSpotlights service:", error);
    throw error;
  }
}
