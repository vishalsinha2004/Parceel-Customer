// src/api/axios.js
import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://127.0.0.1:8000/api/',
    baseURL: 'https://parceel.onrender.com',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    // ONLY add the header if the token actually exists
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout if token is rejected
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Session expired or invalid token. Clearing storage.");
            localStorage.removeItem('access_token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;