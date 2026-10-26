import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, Plus } from 'lucide-react';

export default function KeyList({ keys, onGenerateKey, generating = false }) {
    const [copiedKey, setCopiedKey] = useState('');
    const [visibleKeys, setVisibleKeys] = useState({});

    const copyToClipboard = (keyStr) => {
        navigator.clipboard.writeText(keyStr);
        setCopiedKey(keyStr);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                        <span>My API Keys</span>
                    </h2>
                </div>
                <button
                    onClick={onGenerateKey}
                    title="Generate New Key" aria-label="Generate New Key"
                    disabled={generating}
                    className="grid h-11 w-11 place-items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-3">
                {keys.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No active API keys generated yet.</p>
                ) : (
                    keys.map((k) => (
                        <div key={k.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-sm font-medium text-gray-800">API ID {k.id}</span>
                                <span className="font-mono text-sm text-indigo-700 tracking-wide truncate" aria-label={visibleKeys[k.id] ? 'API key' : 'Hidden API key'}>
                                    {visibleKeys[k.id] ? k.key : '••••••••••••••••••••••••'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${k.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700'}`}>
                                    {k.is_active ? 'Active' : 'Revoked'}
                                </span>
                                <button
                                    onClick={() => setVisibleKeys((current) => ({ ...current, [k.id]: !current[k.id] }))}
                                    className="text-gray-500 hover:text-gray-900 p-1.5 rounded hover:bg-white transition"
                                    title={visibleKeys[k.id] ? 'Hide API Key' : 'Reveal API Key'}
                                    aria-label={visibleKeys[k.id] ? `Hide API key ${k.id}` : `Reveal API key ${k.id}`}
                                >
                                    {visibleKeys[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(k.key)}
                                    disabled={!k.is_active}
                                    className="text-gray-500 hover:text-gray-900 p-1.5 rounded hover:bg-white transition"
                                    title="Copy API Key"
                                    aria-label={`Copy API key ${k.id}`}
                                >
                                    {copiedKey === k.key ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
