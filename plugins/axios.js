import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://api.metalworks.am', // Replace with your API base URL
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') // Or any other method to get your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
