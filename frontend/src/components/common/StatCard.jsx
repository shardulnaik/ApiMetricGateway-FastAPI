import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color }) {
    const colorStyles = {
        amber: 'bg-indigo-50 text-indigo-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        emerald: 'bg-indigo-50 text-indigo-700',
        blue: 'bg-indigo-50 text-indigo-700',
    };

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${colorStyles[color] || colorStyles.indigo}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {value} {unit && <span className="text-sm font-normal text-gray-500">{unit}</span>}
                </h3>
            </div>
        </div>
    );
}
