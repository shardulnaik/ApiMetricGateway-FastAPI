import React, { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export default function KeyManagementTable({ userActivity, onRevokeKey }) {
    const [visibleKeys, setVisibleKeys] = useState({});

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">User Key Control Table</h2>
            <div className="space-y-6">
                {userActivity.map((u) => (
                    <div key={u.user_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div>
                                <span className="font-mono text-xs text-indigo-700 font-semibold mr-2">User #{u.user_id}</span>
                                <span className="text-gray-900 font-semibold text-sm">{u.username || u.email.split('@')[0]}</span>
                            </div>
                            <div className="flex space-x-4 text-xs">
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                                    {u.total_requests} requests
                                </span>
                                <span className="text-gray-500">{u.avg_latency_ms} ms avg</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {u.keys.length === 0 ? (
                                <p className="text-xs text-gray-500">No active keys for this user.</p>
                            ) : (
                                u.keys.map((k) => (
                                    <div key={k.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded border border-gray-200">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xs font-medium text-gray-800">API ID {k.id}</span>
                                            <span className="font-mono text-xs text-indigo-700 truncate" aria-label={visibleKeys[k.id] ? 'API key' : 'Hidden API key'}>
                                                {visibleKeys[k.id] ? k.key : '••••••••••••••••••••••••'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${k.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700'}`}>
                                                {k.is_active ? 'Active' : 'Revoked'}
                                            </span>
                                            <button
                                                onClick={() => setVisibleKeys((current) => ({ ...current, [k.id]: !current[k.id] }))}
                                                className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-white transition"
                                                title={visibleKeys[k.id] ? 'Hide API Key' : 'Reveal API Key'}
                                                aria-label={visibleKeys[k.id] ? `Hide API key ${k.id}` : `Reveal API key ${k.id}`}
                                            >
                                                {visibleKeys[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            {k.is_active && (
                                                <button
                                                    onClick={() => onRevokeKey(k.id)}
                                                    className="flex items-center space-x-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Revoke</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
