import axios from 'axios'
import { redirect } from "react-router-dom"

//this connects frontend with backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/',
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

// blocks a route: bounce to login if no valid cookie
export const requireLogin = async () => {
    const user = await userConfirmation();
    if (!user) throw redirect("/");
    return user;
}

// the reverse: a logged-in user has no business on the login page
export const redirectIfLoggedIn = async () => {
    const user = await userConfirmation();
    return user ? redirect("/home") : null;
}

export const getCollections = async () => {
    try {
        const response = await api.get("/collections/");
        return response.data;
    } catch (error) {
        console.error(errorMessage(error));
        return [];
    }
}

export const getEntries = async (collectionId) => {
    try {
        const response = await api.get("/entries/", {
            params: collectionId ? { collection: collectionId } : {}
        });
        return response.data;
    } catch (error) {
        console.error(errorMessage(error));
        return [];
    }
}

export const homeLoader = async () => {
    await requireLogin();
    return getCollections();
}

export const collectionLoader = async ({ params }) => {
    await requireLogin();
    const entries = await getEntries(params.id);
    return { collectionId: params.id, entries };
}

export const createCollection = async (collectionObj) => {
    try {
        const response = await api.post("/collections/", collectionObj);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const deleteCollection = async (collectionId) => {
    try {
        await api.delete(`/collections/${collectionId}/`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const createEntry = async (entryObj) => {
    try {
        const response = await api.post("/entries/", entryObj);
        return response.data;
    } catch (error) {
        console.error(errorMessage(error));
        return null;
    }
}

export const deleteEntry = async (entryId) => {
    try {
        await api.delete(`/entries/${entryId}/`);
        return true;
    } catch (error) {
        console.error(errorMessage(error));
        return false;
    }
}

export const pronounceEntry = async (entryId, source = "word") => {
    try {
        const response = await api.post(`/entries/${entryId}/pronounce/`, { source });
        return response.data;
    } catch (error) {
        console.error(errorMessage(error));
        return null;
    }
}