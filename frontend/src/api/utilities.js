import axios from 'axios'

//this connects frontend with backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
})

let refreshPromise = null

const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh/').finally(() => { refreshPromise = null })
    }
    return refreshPromise
}

api.interceptors.response.use(
    // On success do nothing
    (response)=>response,
    // on failed/error (401) what to do
    async (error)=>{
        const originalRequest = error.config;

        const isRefreshCall = originalRequest?.url?.includes("auth/refresh")

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall){
            originalRequest._retry = true
            try {
                await refreshAccessToken();
                return api(originalRequest)
            }catch(refreshError){
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api

