import { useEffect, useState } from 'react';
import { Users, Package, Calendar, CreditCard, ShieldCheck, Clock, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col gap-3 min-h-[130px]">
        <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">
                {title}
            </p>

            <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${color}`}
            >
                <Icon size={18} className="text-white" />
            </div>
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {value ?? '—'}
        </p>

        {subtitle && (
            <p className="text-xs text-slate-400">
                {subtitle}
            </p>
        )}
    </div>
);

const QuickCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    textColor,
    borderColor,
    to,
}) => {
    const navigate = useNavigate();

    return (
        <div
            className={`${bgColor} ${borderColor} border rounded-xl p-4 sm:p-5 flex flex-col gap-3 min-h-[140px]`}
        >
            <div className="flex items-center gap-2">
                <Icon size={18} className={textColor} />
                <h3 className={`font-semibold text-sm ${textColor}`}>
                    {title}
                </h3>
            </div>

            <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
                {value}
            </p>

            <button
                onClick={() => navigate(to)}
                className={`flex items-center gap-1 text-sm font-medium ${textColor} hover:opacity-70 transition-opacity w-fit`}
            >
                Review now <ArrowRight size={14} />
            </button>
        </div>
    );
};

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Dashboard
            </h1>

            <p className="text-slate-500 text-sm sm:text-base mt-1">
                Welcome back! Here's what's happening.
            </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
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
                subtitle="All listings"
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

        {/* Quick Actions */}
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
                Quick Actions
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <QuickCard
                title="Pending Verifications"
                value={stats?.pendingVerifications}
                icon={ShieldCheck}
                bgColor="bg-yellow-50"
                textColor="text-yellow-700"
                borderColor="border-yellow-200"
                to="/verifications"
            />

            <QuickCard
                title="Pending Rentals"
                value={stats?.pendingRentals}
                icon={Clock}
                bgColor="bg-red-50"
                textColor="text-red-700"
                borderColor="border-red-200"
                to="/rentals"
            />

            <QuickCard
                title="Total Users"
                value={stats?.totalUsers}
                icon={Users}
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-200"
                to="/users"
            />
        </div>
    </div>
);
}