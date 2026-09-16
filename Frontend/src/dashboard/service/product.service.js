import dashboardAxiosClient from "../config/axios.config";

export async function getAllProducts() {
  const res = await dashboardAxiosClient.get("/product");
  return res.data;
}

export async function getProductById(id) {
  const res = await dashboardAxiosClient.get(`/product/${id}`);
  return res.data;
}

export async function activateProduct(id) {
  const res = await dashboardAxiosClient.patch(`/product/activeproduct/${id}`);
  return res.data;
}

export async function deactivateProduct(id) {
  const res = await dashboardAxiosClient.patch(
    `/product/inactiveproduct/${id}`,
  );
  return res.data;
}

export async function deleteProduct(id) {
  const res = await dashboardAxiosClient.delete(`/product/deleteproduct/${id}`);
  return res.data;
}

export async function createProduct(formData) {
  try {
    const res = await dashboardAxiosClient.post(
      "/product/createproduct",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.log("Error in createProduct service", error);
    throw error;
  }
}

export async function updateProduct(id, productData) {
  try {
    const res = await dashboardAxiosClient.put(
      `/product/updateproduct/${id}`,
      productData,
    );
    return res.data;
  } catch (error) {
    console.log("Error in updateProduct service", error);
    throw error;
  }
}
