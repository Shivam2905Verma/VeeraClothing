import axios from "axios";

const dashboardAxiosClient = axios.create({
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  baseURL: "http://localhost:8000/api/dashboard",
  withCredentials: true,
});

export default dashboardAxiosClient;
