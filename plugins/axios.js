import axios from 'axios'

const apiBaseURL =
  process.env.API_BASE_URL || process.env.BASE_URL || 'https://api.metalworks.am'

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Keep this standalone instance compatible with Sanctum's cookie-based SPA
// authentication. Do not persist bearer credentials in localStorage.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default axiosInstance
