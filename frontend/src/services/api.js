import axios from 'axios';

// Vite injects this at build time; localhost keeps local development simple.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Converts stored backend file paths into browser-loadable URLs.
export const getAssetUrl = (filePath) => {
    if (!filePath) return '';
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${SERVER_BASE_URL}/${encodeURI(normalizedPath)}`;
};

const API = axios.create({
    baseURL: API_BASE_URL,
});

// Attach the JWT to every request after login/register.
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
