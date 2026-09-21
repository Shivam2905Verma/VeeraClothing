import dashboardAxiosClient from "../config/axios.config";

export async function searchDashboardProducts(
  query = "",
  status = "ALL",
  sortBy = "newest",
  page = 1,
  limit = 15,
) {
  try {
    const params = new URLSearchParams();
    if (typeof query === "string" && query.trim()) {
      params.append("query", query.trim());
    }
    if (typeof status === "string" && status && status !== "ALL") {
      params.append("status", status);
    }
    if (typeof sortBy === "string" && sortBy) {
      params.append("sortBy", sortBy);
    }
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const res = await dashboardAxiosClient.get(
      `/product/search?${params.toString()}`,
    );
    return res.data;
  } catch (error) {
    console.log("Error in searchDashboardProducts service", error);
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const res = await dashboardAxiosClient.get(`/product/${id}`);
    return res.data;
  } catch (error) {
    console.log("Error in getProductById service", error);
    throw error;
  }
}

export async function activateProduct(id) {
  try {
    const res = await dashboardAxiosClient.patch(
      `/product/activeproduct/${id}`,
    );
    return res.data;
  } catch (error) {
    console.log("Error in activateProduct service", error);
    throw error;
  }
}

export async function deactivateProduct(id) {
  try {
    const res = await dashboardAxiosClient.patch(
      `/product/inactiveproduct/${id}`,
    );
    return res.data;
  } catch (error) {
    console.log("Error in deactivateProduct service", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const res = await dashboardAxiosClient.delete(
      `/product/deleteproduct/${id}`,
    );
    return res.data;
  } catch (error) {
    console.log("Error in deleteProduct service", error);
    throw error;
  }
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

export async function uploadProductImage(productId, formData) {
  try {
    const res = await dashboardAxiosClient.post(
      `/product/${productId}/uploadImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.log("Error in uploadProductImage service", error);
    throw error;
  }
}

export async function updateProductImage(productId, imageId, formData) {
  try {
    const res = await dashboardAxiosClient.post(
      `/product/product/${productId}/update-image/${imageId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.log("Error in updateProductImage service", error);
    throw error;
  }
}

export async function deleteProductImage(productId, imageId, is_cover) {
  try {
    const res = await dashboardAxiosClient.delete(
      `/product/${productId}/deleteimage/${imageId}`,
      {
        data: {
          is_cover,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.log("Error in deleteProductImage service", error);
    throw error;
  }
}

export async function updateVariant(variantId, variantData) {
  try {
    const res = await dashboardAxiosClient.put(
      `/product/updatevariant/${variantId}`,
      variantData,
    );
    return res.data;
  } catch (error) {
    console.log("Error in updateVariant service", error);
    throw error;
  }
}

export async function deleteVariant(variantId) {
  try {
    const res = await dashboardAxiosClient.delete(
      `/product/deletevariant/${variantId}`,
    );
    return res.data;
  } catch (error) {
    console.log("Error in deleteVariant service", error);
    throw error;
  }
}
