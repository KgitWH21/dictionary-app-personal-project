import axios from 'axios'

//this connects frontend with backend
export default axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
})