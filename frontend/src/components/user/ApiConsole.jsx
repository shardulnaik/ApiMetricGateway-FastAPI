import React, { useState } from 'react';
import {
    ArrowDownRight, ArrowLeftRight, ArrowUpRight, Cloud, CloudSun, Droplets,
    Minus, Play, Sun, TrendingDown, TrendingUp, MapPin, Activity,
} from 'lucide-react';
import { executeTestEndpoint } from '../../services/keyService';

const services = [
    { id: 'weather', name: 'Weather', endpoint: '/api/v1/weather', accent: 'sky' },
    { id: 'stock', name: 'Stock', endpoint: '/api/v1/stock', accent: 'emerald' },
    { id: 'currency', name: 'Currency', endpoint: '/api/v1/currency', accent: 'violet' },
];

function describeResponse(service, data) {
    if (!data || typeof data !== 'object' || data.error || data.detail) {
        return { error: data?.error || data?.detail || 'The service did not return a usable response.' };
    }

    if (service === 'weather') {
        const condition = String(data.condition || 'Weather').toLowerCase();
        const rainy = /rain|storm|drizzle|shower|thunder/.test(condition);
        const sunny = /sun|clear/.test(condition);
        const Icon = rainy ? Droplets : sunny ? Sun : /cloud|overcast|fog|mist/.test(condition) ? Cloud : CloudSun;
        return {
            eyebrow: 'CURRENT CONDITIONS', title: data.condition || 'Conditions unavailable',
            subtitle: data.location ? `Weather in ${data.location}` : 'Local weather',
            Icon, tone: rainy ? 'blue' : sunny ? 'amber' : 'sky',
            metrics: [
                data.temperature != null && { label: 'Temperature', value: String(data.temperature).replace('Â°C', '°C') },
                data.humidity != null && { label: 'Humidity', value: String(data.humidity), Icon: Droplets },
            ].filter(Boolean),
        };
    }

    if (service === 'stock') {
        const change = Number.parseFloat(String(data.change ?? '').replace('%', ''));
        const falling = Number.isFinite(change) && change < 0;
        const rising = Number.isFinite(change) && change > 0;
        return {
            eyebrow: 'MARKET SNAPSHOT', title: data.symbol || 'Stock',
            subtitle: data.market_status ? `Market ${String(data.market_status).toLowerCase()}` : 'Stock performance',
            Icon: rising ? TrendingUp : falling ? TrendingDown : Activity,
            tone: rising ? 'green' : falling ? 'red' : 'neutral',
            badge: rising ? 'RISING' : falling ? 'FALLING' : 'STEADY',
            metrics: [
                data.price_inr != null && { label: 'Price', value: `₹${Number(data.price_inr).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
                data.change != null && { label: 'Change', value: String(data.change), Icon: rising ? ArrowUpRight : falling ? ArrowDownRight : Minus },
            ].filter(Boolean),
        };
    }

    if (service === 'currency') {
        const rate = Number(data.rate);
        const positive = Number.isFinite(rate) && rate > 0;
        return {
            eyebrow: 'CONVERSION RESULT', title: data.pair || 'Currency',
            subtitle: 'Exchange rate', Icon: ArrowLeftRight, tone: 'violet',
            metrics: [
                Number.isFinite(rate) && { label: 'Rate', value: `${rate} ${data.pair || ''}`.trim() },
                data.converted_amount != null && { label: 'Converted amount', value: String(data.converted_amount) },
            ].filter(Boolean),
            note: positive ? 'Conversion available' : null,
        };
    }
    return { error: 'Unknown service response.' };
}

function ResultCard({ result, payload, service }) {
    const [showPayload, setShowPayload] = useState(false);
    const view = describeResponse(service, payload);
    const tone = view.tone || 'neutral';
    const toneClasses = {
        sky: 'result-tone-sky', amber: 'result-tone-amber', blue: 'result-tone-blue',
        green: 'result-tone-green', red: 'result-tone-red', violet: 'result-tone-violet', neutral: 'result-tone-neutral',
    };
    const Icon = view.Icon || Activity;

    return (
        <section className={`result-card ${toneClasses[tone]}`} aria-live="polite">
            <div className="result-card-main">
                <div className="result-symbol"><Icon aria-hidden="true" /></div>
                <div className="result-copy">
                    <p className="result-eyebrow">{view.eyebrow || 'SERVICE RESPONSE'}</p>
                    <h3>{view.error ? 'Request needs attention' : view.title}</h3>
                    <p className="result-subtitle">{view.error || view.subtitle}</p>
                </div>
                {view.badge && <span className="result-badge">{view.badge}</span>}
            </div>
            {!view.error && view.metrics?.length > 0 && (
                <div className="result-metrics">
                    {view.metrics.map(({ label, value, Icon: MetricIcon }) => (
                        <div className="result-metric" key={label}>
                            <span className="result-metric-label">{MetricIcon && <MetricIcon aria-hidden="true" />}{label}</span>
                            <strong>{value}</strong>
                        </div>
                    ))}
                </div>
            )}
            <div className="result-footer">
                <span>{result?.status ? `HTTP ${result.status}` : view.note || 'Live service response'}</span>
                <button type="button" className="payload-toggle" onClick={() => setShowPayload((open) => !open)} aria-expanded={showPayload}>
                    {showPayload ? 'Hide raw response' : 'View raw response'}
                </button>
            </div>
            {showPayload && <pre className="result-payload">{JSON.stringify(payload, null, 2)}</pre>}
        </section>
    );
}

export default function ApiConsole({ keys, selectedKey, setSelectedKey }) {
    const [apiResponse, setApiResponse] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [loadingService, setLoadingService] = useState(null);

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
        try {
            const res = await executeTestEndpoint(service.endpoint, key.key);
            setApiResponse({ payload: res.data, status: res.status });
        } catch (err) {
            setApiResponse({ payload: err.response?.data || { error: 'Request failed. Please try again.' }, status: err.response?.status });
        } finally {
            setLoadingService(null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Play className="w-5 h-5 text-emerald-700" />
                    <span>API Execution Console</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Run a service and see its response as a clear visual snapshot.</p>
            </div>

            <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} aria-label="Select API key"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-indigo-700 font-mono focus:outline-none focus:border-indigo-500">
                <option value="">-- Select API Key --</option>
                {keys.filter((k) => k.is_active).map((k) => <option key={k.id} value={String(k.id)}>API ID {k.id}</option>)}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                    <article className={`service-tile service-${service.accent}`} key={service.id}>
                        <div>
                            <h3>{service.name} API</h3>
                            <p>GET {service.endpoint}</p>
                        </div>
                        <button type="button" disabled={Boolean(loadingService)} onClick={() => handleTestEndpoint(service)}>
                            {loadingService === service.id ? 'Loading…' : `Execute ${service.name} Service`}
                        </button>
                    </article>
                ))}
            </div>

            {loadingService && <div className="result-loading" role="status"><span /> Fetching {services.find((item) => item.id === loadingService)?.name.toLowerCase()} data…</div>}
            {apiResponse && activeService && <ResultCard result={apiResponse} payload={apiResponse.payload || apiResponse} service={activeService} />}
        </div>
    );
}
