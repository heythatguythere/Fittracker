import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { User } from '../shared/types'; // Corrected import path
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
                const res = await axios.get('/api/auth/profile', { withCredentials: true });
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
        const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
        setUser(res.data);
        navigate('/dashboard');
    };

    const signup = async (email: string, password: string, displayName: string) => {
        const res = await axios.post('/api/auth/signup', { email, password, displayName }, { withCredentials: true });
        setUser(res.data);
        navigate('/dashboard');
    };

    const logout = async () => {
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
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