import { useEffect, useState } from 'react';
import { Search, Users as UsersIcon, ShieldCheck, ShieldOff, Mail, Phone, MapPin, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-red-100 text-red-700',
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const limit = 15;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', {
                params: { search: debouncedSearch, page, limit }
            });
            setUsers(res.data.data.users);
            setTotal(res.data.data.total);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearch, page]);

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setActionLoading(userId);
        try {
            await api.put(`/admin/users/${userId}/status`, { account_status: newStatus });
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, account_status: newStatus } : u))
            );
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user status.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Users</h1>
                <p className="text-slate-500 text-sm mt-1">{total} registered user(s)</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email or phone..."
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <UsersIcon size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No users found.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {users.map((u) => {
                            const isExpanded = expandedId === u.id;
                            return (
                                <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : u.id)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {u.profile_image ? (
                                                <img src={u.profile_image} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                                                    {u.first_name?.[0]}{u.last_name?.[0]}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {u.first_name} {u.last_name}
                                                    </h3>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[u.account_status]}`}>
                                                        {u.account_status}
                                                    </span>
                                                    {u.is_verified && (
                                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                                            <ShieldCheck size={12} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-2" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />}
                                    </button>

                                    {/* Expanded */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                                                <p className="flex items-center gap-2 text-slate-600">
                                                    <Mail size={14} className="text-gray-400" /> {u.email}
                                                </p>
                                                {u.phone_number && (
                                                    <p className="flex items-center gap-2 text-slate-600">
                                                        <Phone size={14} className="text-gray-400" /> {u.phone_number}
                                                    </p>
                                                )}
                                                {u.city && (
                                                    <p className="flex items-center gap-2 text-slate-600">
                                                        <MapPin size={14} className="text-gray-400" /> {u.city}
                                                    </p>
                                                )}
                                                <p className="text-slate-600">
                                                    Joined {formatDate(u.created_at)}
                                                </p>
                                                <p className="text-slate-600">
                                                    Deposit: {u.deposit_paid ? 'Paid ✅' : 'Not Paid ❌'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleStatus(u.id, u.account_status)}
                                                disabled={actionLoading === u.id}
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                                                    u.account_status === 'ACTIVE'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}>
                                                {u.account_status === 'ACTIVE' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                                                {u.account_status === 'ACTIVE' ? 'Suspend User' : 'Reactivate User'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}