import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { executeTestEndpoint } from '../../services/keyService';

export default function ApiConsole({ keys, selectedKey, setSelectedKey }) {
    const [apiResponse, setApiResponse] = useState(null);

    const handleTestEndpoint = async (endpoint) => {
        if (!selectedKey) {
            alert('Please select or generate an API Key first.');
            return;
        }
        try {
            const res = await executeTestEndpoint(endpoint, selectedKey);
            setApiResponse(res.data);
        } catch (err) {
            setApiResponse(err.response?.data || { error: 'Request Failed' });
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Play className="w-5 h-5 text-emerald-700" />
                    <span>API Execution Console</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Select an API key from your list, trigger service endpoints, and view live JSON payloads.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-indigo-700 font-mono focus:outline-none focus:border-indigo-500"
                >
                    <option value="">-- Select API Key --</option>
                    {keys.map((k) => (
                        <option key={k.id} value={k.key}>{k.key}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Weather API</h4>
                        <p className="text-xs text-gray-500">GET /api/v1/weather</p>
                    </div>
                    <button
                        onClick={() => handleTestEndpoint('/api/v1/weather')}
                        className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium text-xs py-2 rounded border border-gray-200 transition"
                    >
                        Execute Weather Service
                    </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Stock API</h4>
                        <p className="text-xs text-gray-500">GET /api/v1/stock</p>
                    </div>
                    <button
                        onClick={() => handleTestEndpoint('/api/v1/stock')}
                        className="w-full bg-white hover:bg-gray-100 text-emerald-700 font-medium text-xs py-2 rounded border border-gray-200 transition"
                    >
                        Execute Stock Service
                    </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Currency API</h4>
                        <p className="text-xs text-gray-500">GET /api/v1/currency</p>
                    </div>
                    <button
                        onClick={() => handleTestEndpoint('/api/v1/currency')}
                        className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium text-xs py-2 rounded border border-gray-200 transition"
                    >
                        Execute Currency Service
                    </button>
                </div>
            </div>

            {apiResponse && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-700">
                    <p className="text-gray-500 mb-2">// Response Payload</p>
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}