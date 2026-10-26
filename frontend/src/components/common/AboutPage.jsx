import React from 'react';
import { ArrowLeft, FileKey2, Search, Play, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
    const goBack = () => {
        if (window.opener && !window.opener.closed) window.close();
        else if (window.history.length > 1) window.history.back();
        else window.location.assign(window.location.pathname);
    };
    const stages = [
        { Icon: ShieldCheck, label: 'Sign in' },
        { Icon: FileKey2, label: 'Create a key' },
        { Icon: Search, label: 'Choose a service' },
        { Icon: Play, label: 'View response' },
    ];
    const steps = [
        'Sign in or register for an account.',
        'Create an API key and copy it when needed.',
        'Open Console, select an active key, and run Weather, Stock, or Currency.',
        'Review the service result. Administrators can also review analytics and manage keys.',
    ];
    return <main className="min-h-screen bg-gray-50 text-gray-900 px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
            <button onClick={goBack} className="mb-7 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100" aria-label="Back"><ArrowLeft className="h-4 w-4" />Back</button>
            <header className="mb-6"><h1 className="text-2xl font-bold">How this app works</h1><p className="mt-1 text-sm text-gray-500">From account setup to an API response.</p></header>
            <section className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white px-4 py-5 sm:grid-cols-4 sm:gap-0" aria-label="Application workflow">
                {stages.map(({ Icon, label }, index) => <div key={label} className="relative flex items-center justify-center gap-2 py-2 text-center">
                    <Icon className="h-5 w-5 shrink-0 text-indigo-600" />
                    <span className="text-xs font-semibold sm:text-sm">{label}</span>
                    {index < stages.length - 1 && <span className="absolute -right-2 hidden text-gray-400 sm:block" aria-hidden="true">→</span>}
                </div>)}
            </section>
            <ol className="space-y-3 pl-5 text-sm leading-6 text-gray-600">
                {steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
            </ol>
        </div>
    </main>;
}
