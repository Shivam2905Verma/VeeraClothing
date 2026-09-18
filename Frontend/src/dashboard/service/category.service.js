import dashboardAxiosClient from "../config/axios.config";

export async function getCategories() {
  try {
    const res = await dashboardAxiosClient.get("/categories");
    return res.data;
  } catch (error) {
    console.error("Error in getCategories service:", error);
    throw error;
  }
}

export async function createCategory({ categoryName, measurementTypeIds = [] }) {
  try {
    const res = await dashboardAxiosClient.post("/categories/createcategory", {
      categoryName,
      measurementTypeIds,
    });
    return res.data;
  } catch (error) {
    console.error("Error in createCategory service:", error);
    throw error;
  }
}

export async function updateCategory(id, { categoryName, measurementTypeIds }) {
  try {
    const res = await dashboardAxiosClient.put(
      `/categories/updatecategory/${id}`,
      {
        categoryName,
        measurementTypeIds,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error in updateCategory service:", error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const res = await dashboardAxiosClient.delete(
      `/categories/deletecategory/${id}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in deleteCategory service:", error);
    throw error;
  }
}
