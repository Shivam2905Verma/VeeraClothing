import axios from "axios";

const axiosClient = axios.create({
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  baseURL: "http://localhost:8000/api/main",
  withCredentials: true,
});

export default axiosClient;
