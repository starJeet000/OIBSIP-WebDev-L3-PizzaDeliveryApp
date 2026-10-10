import axios from "axios";

// Create a configured Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request Interceptor: Attach token to headers
api.interceptors.request.use(
  (config) => {
    // Check both storages depending on "Remember Me" selection
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle automatic logout on expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend returns 401 Unauthorized (token expired/invalid)
    if (error.response && error.response.status === 401) {
      // Clear all authentication states
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Force redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
