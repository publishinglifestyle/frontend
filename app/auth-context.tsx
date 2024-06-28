import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import Cookies from 'js-cookie';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, expirationTime: number) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!Cookies.get('authToken'));

    useEffect(() => {
        // Set up an interval to check the cookie every minute
        const interval = setInterval(() => {
            const token = Cookies.get('authToken');
            if (!token && isAuthenticated) {
                // If the cookie doesn't exist and the user is marked as authenticated, reload the page
                console.log('Auth token expired, reloading page');
                window.location.reload();
            }
        }, 60000); // 60000ms = 1 minute

        return () => {
            // Clear the interval when the component is unmounted or when isAuthenticated changes
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    const login = (token: string, expirationTime: number) => {
        Cookies.set('authToken', token, { expires: expirationTime });
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('authToken');
        Cookies.remove('user_id');
        Cookies.remove('user_name');
        setIsAuthenticated(false);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};