import React, { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';

export default function KeyList({ keys, onGenerateKey }) {
    const [copiedKey, setCopiedKey] = useState('');

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
                        <Key className="w-5 h-5 text-indigo-700" />
                        <span>My API Keys</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Generate and copy your credentials to access microservices.</p>
                </div>
                <button
                    onClick={onGenerateKey}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-sm"
                >
                    + Generate New Key
                </button>
            </div>

            <div className="space-y-3">
                {keys.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No active API keys generated yet.</p>
                ) : (
                    keys.map((k) => (
                        <div key={k.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <div className="font-mono text-sm text-indigo-700 tracking-wide">{k.key}</div>
                            <div className="flex items-center space-x-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${k.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700'}`}>
                                    {k.is_active ? 'Active' : 'Revoked'}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(k.key)}
                                    className="text-gray-500 hover:text-gray-900 p-1.5 rounded hover:bg-white transition"
                                    title="Copy API Key"
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
