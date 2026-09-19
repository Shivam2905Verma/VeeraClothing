import axiosClient from "../config/axios.config";

export async function getUserAddresses() {
  try {
    const res = await axiosClient.get("/address");
    return res.data;
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    throw error;
  }
}

export async function saveUserAddress(addressData) {
  try {
    const res = await axiosClient.post("/address", addressData);
    return res.data;
  } catch (error) {
    console.error("Error in saveUserAddress:", error);
    throw error;
  }
}

export async function updateUserAddress(addressId, addressData) {
  try {
    const res = await axiosClient.put(`/address/${addressId}`, addressData);
    return res.data;
  } catch (error) {
    console.error("Error in updateUserAddress:", error);
    throw error;
  }
}

export async function deleteUserAddress(addressId) {
  try {
    const res = await axiosClient.delete(`/address/${addressId}`);
    return res.data;
  } catch (error) {
    console.error("Error in deleteUserAddress:", error);
    throw error;
  }
}

