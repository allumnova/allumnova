import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (token: string, user: User, rememberMe?: boolean) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (token && user) {
            setState({
                token,
                user: JSON.parse(user),
                isAuthenticated: true,
                loading: false,
            });
        } else {
            setState((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    const login = (token: string, user: User, rememberMe: boolean = false) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(user));
        
        setState({
            token,
            user,
            isAuthenticated: true,
            loading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setState({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    const setUser = (user: User) => {
        const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));
        setState((prev) => ({ ...prev, user }));
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
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
