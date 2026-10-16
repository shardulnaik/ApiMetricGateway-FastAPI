import React from 'react';
import { Activity, ShieldAlert, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
    const { userRole, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isAdmin = userRole === 'admin';

    return (
        <nav className={`border-b sticky top-0 z-50 px-6 py-4 backdrop-blur-md ${isAdmin ? 'border-indigo-200 bg-white/95' : 'border-gray-200 bg-white/95'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {isAdmin ? <ShieldAlert className="w-7 h-7 text-indigo-700" /> : <Activity className="w-7 h-7 text-indigo-700" />}
                    <span className="text-xl font-bold tracking-wider text-gray-900">
                        APIMetric {isAdmin ? <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded ml-2">ADMIN ANALYTICS CONSOLE</span> : 'User Portal'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm transition"
                    >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
