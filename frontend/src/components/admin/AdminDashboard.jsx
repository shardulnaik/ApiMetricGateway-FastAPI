import React, { useState, useEffect } from 'react';
import { Users, Key, Server, Clock } from 'lucide-react';
import Navbar from '../common/Navbar';
import StatCard from '../common/StatCard';
import AnalyticsCharts from './AnalyticsCharts';
import KeyManagementTable from './KeyManagementTable';
import { getAdminSummary, revokeKey } from '../../services/adminService';

export default function AdminDashboard() {
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
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={adminSummary.total_system_users} icon={Users} color="indigo" />
                    <StatCard title="Active API Keys" value={adminSummary.total_keys_issued} icon={Key} color="indigo" />
                    <StatCard title="Global Requests" value={adminSummary.total_system_requests} icon={Server} color="emerald" />
                    <StatCard title="Global Avg Latency" value={adminSummary.global_avg_latency_ms} unit="ms" icon={Clock} color="blue" />
                </div>

                <AnalyticsCharts userActivity={adminSummary.user_activity} />

                <KeyManagementTable
                    userActivity={adminSummary.user_activity}
                    onRevokeKey={handleRevoke}
                />
            </main>
        </div>
    );
}
