import axios from 'axios';

// Create a central axios instance
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Point this to your backend URL
});

// Request Interceptor: Automatically attach the token to every request
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