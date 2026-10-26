import React from 'react';
import { ArrowLeft, KeyRound, Play, ShieldCheck, ChartNoAxesCombined, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AboutPage() {
    const { toggleTheme } = useTheme();
    const goBack = () => {
        if (window.opener && !window.opener.closed) window.close();
        else if (window.history.length > 1) window.history.back();
        else window.location.assign(window.location.pathname);
    };
    const steps = [
        { Icon: ShieldCheck, title: 'Sign in', text: 'Sign in to your user or administrator account, or create an account from the welcome screen.' },
        { Icon: KeyRound, title: 'Manage API keys', text: 'Users can create, reveal, and copy their API keys. Administrators can review and revoke keys.' },
        { Icon: Play, title: 'Run services', text: 'Choose an active key and run the weather, stock, or currency service from the console.' },
        { Icon: ChartNoAxesCombined, title: 'Review activity', text: 'The administrator analytics view summarizes users, keys, requests, and service activity.' },
    ];
    return <main className="min-h-screen bg-gray-50 text-gray-900 px-5 py-6 sm:px-10">
        <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-12">
                <button onClick={goBack} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100" aria-label="Back"><ArrowLeft className="h-4 w-4" />Back</button>
                <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600" aria-label="Toggle color theme" title="Toggle color theme"><Sun className="h-4 w-4" /></button>
            </div>
            <header className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-600">APIMetric</p><h1 className="text-3xl font-bold">How this app works</h1><p className="mt-2 text-gray-500">A quick guide to keys, services, and analytics.</p></header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {steps.map(({ Icon, title, text }, index) => <section key={title} className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div>
                    <p className="mb-1 text-xs font-semibold text-indigo-600">STEP {index + 1}</p><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
                </section>)}
            </div>
            <p className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-sm leading-6 text-gray-600">API keys identify requests to the gateway. Keep active keys private, and revoke any key that should no longer be used.</p>
        </div>
    </main>;
}
