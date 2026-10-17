import React from 'react';
import { Activity, ShieldAlert, LogOut, Moon, Sun, Users, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onSectionToggle, sectionLabel }) {
    const { userRole, username, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isAdmin = userRole === 'admin';

    return (
        <nav className={`border-b sticky top-0 z-50 px-6 py-4 backdrop-blur-md ${isAdmin ? 'border-indigo-200 bg-white/95' : 'border-gray-200 bg-white/95'}`}>
            <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center min-w-0 space-x-3">
                    {isAdmin ? <ShieldAlert className="w-7 h-7 text-indigo-700" /> : <Activity className="w-7 h-7 text-indigo-700" />}
                    <span className="text-lg sm:text-xl font-bold tracking-wider text-gray-900">
                        APIMetric {isAdmin ? <span className="hidden sm:inline text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded ml-2">ADMIN ANALYTICS CONSOLE</span> : <><span className="hidden sm:inline">User Portal</span>{username && <span className="ml-2 text-xs font-medium text-indigo-700">@{username}</span>}</>}
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    {onSectionToggle && (
                        <button onClick={onSectionToggle} className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition">
                            {isAdmin ? <Users className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span>{sectionLabel}</span>
                        </button>
                    )}
                    <button
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition"
                    >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'} mode</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
