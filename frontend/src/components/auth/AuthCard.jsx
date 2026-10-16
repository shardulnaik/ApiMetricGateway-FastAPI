import React, { useState } from 'react';
import { Activity, AlertCircle, Mail, Lock, ShieldAlert, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { loginUser, registerUser, registerAdmin } from '../../services/authService';

export default function AuthCard() {
    const { saveAuth } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKeyInput, setAdminKeyInput] = useState('');
    const [authError, setAuthError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            if (authMode === 'register-user') {
                await registerUser(email, password);
                setAuthMode('login');
                setAuthError('Registration successful! Please log in.');
            } else if (authMode === 'register-admin') {
                await registerAdmin(email, password, adminKeyInput);
                setAuthMode('login');
                setAuthError('Admin account created! Please log in.');
            } else {
                const data = await loginUser(email, password);
                saveAuth(data.access_token, data.role);
            }
        } catch (err) {
            setAuthError(err.response?.data?.detail || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                className="absolute right-6 top-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
            >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
            </button>
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-center space-x-2 mb-6">
                    <Activity className="w-8 h-8 text-indigo-700" />
                    <span className="text-2xl font-bold tracking-wider text-gray-900">APIMetric Gateway</span>
                </div>

                <div className="flex mb-6 border-b border-gray-200 text-xs font-semibold">
                    <button
                        className={`flex-1 pb-3 text-center ${authMode === 'login' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
                        onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 pb-3 text-center ${authMode === 'register-user' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
                        onClick={() => { setAuthMode('register-user'); setAuthError(''); }}
                    >
                        User Register
                    </button>
                    <button
                        className={`flex-1 pb-3 text-center ${authMode === 'register-admin' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
                        onClick={() => { setAuthMode('register-admin'); setAuthError(''); }}
                    >
                        Admin Register
                    </button>
                </div>

                {authError && (
                    <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center space-x-2 text-indigo-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-indigo-500"
                                placeholder="developer@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {authMode === 'register-admin' && (
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-indigo-700 mb-1">Admin Secret Key</label>
                            <div className="relative">
                                <ShieldAlert className="absolute left-3 top-3 w-5 h-5 text-indigo-700" />
                                <input
                                    type="password"
                                    required
                                    value={adminKeyInput}
                                    onChange={(e) => setAdminKeyInput(e.target.value)}
                                    className="w-full bg-gray-50 border border-indigo-300 rounded-lg py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter admin secret key"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full font-semibold py-2.5 rounded-lg transition duration-200 shadow-sm ${authMode === 'register-admin'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                    >
                        {authMode === 'login' ? 'Sign In' : authMode === 'register-user' ? 'Create User Account' : 'Create Admin Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
