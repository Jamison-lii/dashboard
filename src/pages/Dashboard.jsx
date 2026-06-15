import { useEffect, useState } from 'react';
import { Users, Package, Calendar, CreditCard, ShieldCheck, Clock, Wallet } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
        <p className="text-3xl font-bold text-slate-900">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (err) {
                setError('Failed to load stats.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                    subtitle="Registered users"
                />
                <StatCard
                    title="Total Listings"
                    value={stats?.totalListings}
                    icon={Package}
                    color="bg-purple-500"
                    subtitle="Active listings"
                />
                <StatCard
                    title="Total Rentals"
                    value={stats?.totalRentals}
                    icon={Calendar}
                    color="bg-green-500"
                    subtitle="All rental requests"
                />
                <StatCard
                    title="Total Payments"
                    value={stats?.totalPayments}
                    icon={CreditCard}
                    color="bg-orange-500"
                    subtitle="All transactions"
                />
                <StatCard
                    title="Pending Verifications"
                    value={stats?.pendingVerifications}
                    icon={ShieldCheck}
                    color="bg-yellow-500"
                    subtitle="Awaiting review"
                />
                <StatCard
                    title="Pending Rentals"
                    value={stats?.pendingRentals}
                    icon={Clock}
                    color="bg-red-500"
                    subtitle="Awaiting acceptance"
                />
                <StatCard
                    title="Active Deposits"
                    value={stats?.activeDeposits}
                    icon={Wallet}
                    color="bg-teal-500"
                    subtitle="Security deposits held"
                />
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck size={20} className="text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Pending Verifications</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 mb-3">{stats?.pendingVerifications}</p>
                    <a href="/verifications" className="text-sm font-medium text-yellow-700 hover:underline">
                        Review now →
                    </a>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={20} className="text-red-600" />
                        <h3 className="font-semibold text-red-800">Pending Rentals</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700 mb-3">{stats?.pendingRentals}</p>
                    <a href="/rentals" className="text-sm font-medium text-red-700 hover:underline">
                        Review now →
                    </a>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-700 mb-3">{stats?.totalUsers}</p>
                    <a href="/users" className="text-sm font-medium text-blue-700 hover:underline">
                        View all →
                    </a>
                </div>
            </div>
        </div>
    );
}