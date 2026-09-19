import axiosClient from "../config/axios.config";

export async function getAllCategories() {
  try {
    const res = await axiosClient.get("/categories");
    return res.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
