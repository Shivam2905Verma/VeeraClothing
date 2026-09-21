import dashboardAxiosClient from "../config/axios.config";

export async function login({ userId, password }) {
  try {
    const res = await dashboardAxiosClient.post("/auth/login", {
      userId,
      password,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    console.error("Error in admin login service", error);
    throw error;
  }
}

export async function logout() {
  try {
    const res = await dashboardAxiosClient.post("/auth/logout");
    return res.data;
  } catch (error) {
    console.error("Error in admin logout service", error);
    throw error;
  }
}

export async function getMe() {
  try {
    const res = await dashboardAxiosClient.get("/auth/getme");
    return res.data;
  } catch (error) {
    console.error("Error in getMe service", error);
    throw error;
  }
}
