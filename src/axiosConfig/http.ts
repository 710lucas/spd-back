import axios from "axios";

export const http = axios.create({
    timeout: 5000,
  });
  
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        // Lógica para timeout
      }
      return Promise.reject(error);
    },
  );