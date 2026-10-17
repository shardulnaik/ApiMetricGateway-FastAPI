import React, { useState, useEffect } from 'react';
import { Users, Key, Server, Clock } from 'lucide-react';
import Navbar from '../common/Navbar';
import StatCard from '../common/StatCard';
import AnalyticsCharts from './AnalyticsCharts';
import KeyManagementTable from './KeyManagementTable';
import { getAdminSummary, revokeKey } from '../../services/adminService';

export default function AdminDashboard() {
    const [showKeyConsole, setShowKeyConsole] = useState(false);
    const [adminSummary, setAdminSummary] = useState({
        total_system_users: 0,
        total_keys_issued: 0,
        total_system_requests: 0,
        global_avg_latency_ms: 0,
        user_activity: [],
        status_breakdown: {}
    });

    const fetchSummary = async () => {
        try {
            const res = await getAdminSummary();
            setAdminSummary(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleRevoke = async (keyId) => {
        try {
            await revokeKey(keyId);
            fetchSummary();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to revoke key');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar onSectionToggle={() => setShowKeyConsole((current) => !current)} sectionLabel={showKeyConsole ? 'Analytics' : 'User Key Console'} />
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
                {showKeyConsole ? (
                    <KeyManagementTable userActivity={adminSummary.user_activity} onRevokeKey={handleRevoke} />
                ) : (
                <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard title="Total Users" value={adminSummary.total_system_users} icon={Users} color="indigo" />
                    <StatCard title="Active API Keys" value={adminSummary.total_keys_issued} icon={Key} color="indigo" />
                    <StatCard title="Global Requests" value={adminSummary.total_system_requests} icon={Server} color="emerald" />
                    <StatCard title="Global Avg Latency" value={adminSummary.global_avg_latency_ms} unit="ms" icon={Clock} color="blue" />
                </div>

                <AnalyticsCharts userActivity={adminSummary.user_activity} />
                </div>
                )}
            </main>
        </div>
    );
}
