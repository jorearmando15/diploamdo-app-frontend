import axios from "axios";

export const axiosConfig = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

// Configurar un interceptor para añadir el token a las solicitudes
axiosConfig.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // Asegúrate de que este nombre coincide
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosConfig.interceptors.response.use(
  response => response,
  error => {
    if (
      error &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.clear();
      sessionStorage.clear();
      //window.location.pathname = "/login";
    }
    return Promise.reject(error);
  }
);
