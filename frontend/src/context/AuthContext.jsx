import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    const saveAuth = (accessToken, role, userName = '') => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role);
        if (userName) localStorage.setItem('username', userName);
        else localStorage.removeItem('username');
        setToken(accessToken);
        setUserRole(role);
        setUsername(userName || '');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setToken('');
        setUserRole('user');
        setUsername('');
    };

    return (
        <AuthContext.Provider value={{ token, userRole, username, saveAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
