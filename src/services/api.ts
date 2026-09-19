import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

//interceptador unico de auth - pega token do localstorage em toda request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// interceptador de responde, se vier 401, desloga
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isGuest");
      //Evita loop infinito se estiver no /login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

