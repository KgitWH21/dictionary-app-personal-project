import axios from 'axios'

//this connects frontend with backend
const api = axios.create({
    baseURL: 'import.meta.env.VITE_API_URL || '/api/'',
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

export const errorMessage = (error) => {
    const data = error.response?.data;
    if (!data) return "Could not reach the server.";
    return typeof data === "string" ? data : JSON.stringify(data);
}

export const userLogin = async (username, password) => {
    try {
        const response = await api.post("/auth/login/", { username, password });
        return response.data.user;
    } catch (error) {
        alert(errorMessage(error));
        return null;
    }
}

export const userRegister = async (userObj) => {
    try {
        const response = await api.post("/auth/register/", userObj);
        return response.data.user;
    } catch (error) {
        alert(errorMessage(error));
        return null;
    }
}

export const userLogOut = async () => {
    try {
        await api.post("/auth/logout/");
    } catch (error) {
        console.error("Logout request failed;", error);
    }
    return null;
}

export const userConfirmation = async () => {
    try {
        const response = await api.get("/auth/me/");
        return response.data;
    } catch (error) {
        return null;
    }
}

