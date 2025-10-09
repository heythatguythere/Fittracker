import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { User } from '../shared/types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                // CORRECTED: Use the '/api/current_user' endpoint
                const res = await axios.get('/api/current_user', { withCredentials: true });
                setUser(res.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        // CORRECTED: Use the '/auth/login' endpoint
        const res = await axios.post('/auth/login', { email, password }, { withCredentials: true });
        setUser(res.data.user); // The user object is nested under 'user'
        navigate('/dashboard');
    };

    const signup = async (email: string, password: string, displayName: string) => {
        // CORRECTED: Use the '/auth/register' endpoint
        const res = await axios.post('/auth/register', { email, password, displayName }, { withCredentials: true });
        setUser(res.data.user); // The user object is nested
        navigate('/dashboard');
    };

    const logout = async () => {
        // CORRECTED: Use GET method for '/auth/logout' endpoint
        await axios.get('/auth/logout', { withCredentials: true });
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};