import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

// Stores the logged-in user and auth actions for the whole React app.
const AuthContext = createContext();

// Components call useAuth() instead of importing the context directly.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On page refresh, validate any saved token before rendering protected UI.
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await API.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Logs in, stores the JWT, and updates global user state.
    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    // Registers a new account and immediately starts the logged-in session.
    const register = async (name, email, password) => {
        const { data } = await API.post('/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    // Clears local auth state so future API calls no longer include a token.
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser , login,  register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
