import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard/Dashboard'; 
import ProfilePage from './pages/Profile/Profile';
import RoomPage from './pages/Room';

// Defines the client-side pages and redirects the root URL to login.
const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/room/:id" element={<RoomPage />} /> 
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;
