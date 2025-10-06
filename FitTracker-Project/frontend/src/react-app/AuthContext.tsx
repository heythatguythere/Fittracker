// In src/react-app/AuthContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../../shared/types'; // Adjust path if needed

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => Promise<void>; // Make it return a promise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/current_user', { withCredentials: true })
            .then(res => {
                if (res.data) setUser(res.data);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    // --- THIS IS THE FIX ---
    // Make the logout function async so we can await it
    const logout = async () => {
        try {
            await axios.get('/auth/logout', { withCredentials: true });
            setUser(null); // Clear the user state
        } catch (error) {
            console.error("Logout API call failed:", error);
            setUser(null); // Clear the user state even if the call fails
        }
    };

    const value = { user, loading, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}