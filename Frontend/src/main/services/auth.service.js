import axiosClient from "../config/axios.config";

export async function loginUser(credentials) {
  try {
    const res = await axiosClient.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const res = await axiosClient.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    console.error("Error in registration:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const res = await axiosClient.post("/auth/logout");
    return res.data;
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
}

export async function getMe() {
  try {
    const res = await axiosClient.get("/auth/getme");
    return res.data;
  } catch (error) {
    console.error("Error in getMe:", error);
    throw error;
  }
}
