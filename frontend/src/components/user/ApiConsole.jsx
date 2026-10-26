import React, { useState } from 'react';
import { executeTestEndpoint } from '../../services/keyService';

const services = [
    { id: 'weather', name: 'Weather', endpoint: '/api/v1/weather', accent: 'sky' },
    { id: 'stock', name: 'Stock', endpoint: '/api/v1/stock', accent: 'emerald' },
    { id: 'currency', name: 'Currency', endpoint: '/api/v1/currency', accent: 'violet' },
];

function formatTimestamp(value, dateOnly = false) {
    if (!value) return 'Time unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', dateOnly
        ? { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }
        : { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }
    ).format(date);
}

function ResultCard({ payload, service }) {
    const data = payload;
    const error = data?.detail || data?.error || (!data || typeof data !== 'object' ? 'The service did not return a usable response.' : null);
    let title = '';
    let subtitle = '';
    let metrics = [];
    let updated = '';
    if (!error && service === 'weather') {
        title = data.condition;
        subtitle = `Weather in ${data.location}`;
        metrics = [
            { label: 'Temperature', value: `${data.temperature_c} °C` },
            { label: 'Humidity', value: `${data.humidity_percent}%` },
        ];
        updated = `Last updated ${formatTimestamp(data.updated_at)} · Weather by ${data.data_source || 'weather provider'}`;
    } else if (!error && service === 'stock') {
        title = data.symbol || 'Indian market index';
        subtitle = 'Indian stock market';
        metrics = [
            { label: 'Current index value', value: `${Number(data.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })} points` },
            { label: 'Change', value: data.change_percent == null ? 'Unavailable' : `${data.change_percent > 0 ? '+' : ''}${data.change_percent}%` },
        ];
        updated = `Last updated ${formatTimestamp(data.updated_at)}`;
    } else if (!error && service === 'currency') {
        title = 'USD to INR';
        subtitle = 'Exchange rate';
        metrics = [{ label: '1 USD equals', value: `₹${Number(data.rate).toFixed(2)} INR` }];
        updated = `Rate date ${formatTimestamp(data.updated_at, true)} · Reference rate updates daily`;
    }

    return <section className="result-card result-tone-neutral" aria-live="polite">
        <div className="result-card-main"><div className="result-copy">
            <h3>{error ? 'Service unavailable' : title}</h3>
            <p className="result-subtitle">{error || subtitle}</p>
        </div></div>
        {!error && <div className="result-metrics result-metrics-plain">
            {metrics.map(({ label, value }) => <div className="result-metric" key={label}><span className="result-metric-label">{label}</span><strong>{value}</strong></div>)}
        </div>}
        {!error && <p className="result-updated">{updated}</p>}
    </section>;
}

export default function ApiConsole({ keys, selectedKey, setSelectedKey }) {
    const [apiResponse, setApiResponse] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [loadingService, setLoadingService] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

    const handleTestEndpoint = async (service) => {
        if (!selectedKey) {
            setApiResponse({ error: 'Select an active API key to run a service.' });
            setActiveService(service.id);
            return;
        }
        const key = keys.find((item) => String(item.id) === selectedKey);
        setActiveService(service.id);
        if (!key?.is_active) {
            setApiResponse({ error: 'Select an active API key.' });
            return;
        }
        setLoadingService(service.id);
        setApiResponse(null);
        const loaderTimer = setTimeout(() => setShowLoader(true), 1000);
        try {
            const res = await executeTestEndpoint(service.endpoint, key.key);
            setApiResponse({ payload: res.data });
        } catch (err) {
            setApiResponse({ payload: err.response?.data || { error: 'Request failed. Please try again.' } });
        } finally {
            clearTimeout(loaderTimer);
            setShowLoader(false);
            setLoadingService(null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">API Execution Console</h2>
            <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} aria-label="Select API key"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-indigo-700 font-mono focus:outline-none focus:border-indigo-500">
                <option value="">-- Select API Key --</option>
                {keys.filter((k) => k.is_active).map((k) => <option key={k.id} value={String(k.id)}>API ID {k.id}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => <article className={`service-tile service-${service.accent}`} key={service.id}>
                    <h3>{service.name} API</h3>
                    <button type="button" disabled={Boolean(loadingService)} onClick={() => handleTestEndpoint(service)}>
                        {loadingService === service.id ? 'Loading...' : `Execute ${service.name} Service`}
                    </button>
                </article>)}
            </div>
            {showLoader && loadingService && <div className="result-loading" role="status"><span /> Fetching {services.find((item) => item.id === loadingService)?.name.toLowerCase()} data...</div>}
            {apiResponse && activeService && <ResultCard payload={apiResponse.payload || apiResponse} service={activeService} />}
        </div>
    );
}
