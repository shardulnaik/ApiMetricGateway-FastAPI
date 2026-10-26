import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onSectionToggle, sectionLabel }) {
    const { userRole, username, logout } = useAuth();
    const isAdmin = userRole === 'admin';
    return (
        <nav className="border-b sticky top-0 z-50 px-6 py-3 backdrop-blur-md border-gray-200 bg-white/95">
            <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center min-w-0">
                    <span className="text-lg sm:text-xl font-bold tracking-wide text-gray-900">
                        {isAdmin ? 'Admin Analytics Console' : <>APIMetric{username && <span className="ml-2 text-xs font-medium text-indigo-700">@{username}</span>}</>}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {onSectionToggle && <button onClick={onSectionToggle} title={sectionLabel} aria-label={sectionLabel} className="flex h-10 items-center gap-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 rounded-lg text-sm transition">
                        <span>{sectionLabel}</span>
                    </button>}
                    <button onClick={logout} aria-label="Sign out" title="Sign out" className="nav-icon-button"><LogOut className="w-4 h-4" /></button>
                </div>
            </div>
        </nav>
    );
}
