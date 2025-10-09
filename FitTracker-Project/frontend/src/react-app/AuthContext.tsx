import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../shared/types';
import { useNavigate } from 'react-router-dom';
import api from './api'; // IMPORT our new configured api client

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
                // USE the new 'api' client instead of 'axios'
                const res = await api.get('/api/current_user');
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
        // USE the new 'api' client
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user);
    };

    const signup = async (email: string, password: string, displayName: string) => {
        // USE the new 'api' client
        const res = await api.post('/auth/register', { email, password, displayName });
        setUser(res.data.user);
    };

    const logout = async () => {
        // USE the new 'api' client
        await api.get('/auth/logout');
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