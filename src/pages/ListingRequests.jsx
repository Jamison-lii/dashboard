import { useEffect, useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Phone, MapPin, Mail, Check, X, MessageCircle } from 'lucide-react';
import api from '../api/axios';

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONTACTED: 'bg-blue-100 text-blue-700',
    CONVERTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
};

export default function ListingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const res = await api.get('/admin/listing-requests', { params });
            setRequests(res.data.data.listingRequests);
        } catch (err) {
            setError('Failed to load listing requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleUpdateStatus = async (requestId, status) => {
        setActionLoading(requestId);
        try {
            await api.put(`/admin/listing-requests/${requestId}/status`, { status });
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status } : r))
            );
            if (statusFilter !== 'ALL') {
                setRequests((prev) => prev.filter((r) => r.id !== requestId));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const filters = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'CONTACTED', label: 'Contacted' },
        { value: 'CONVERTED', label: 'Converted' },
        { value: 'DECLINED', label: 'Declined' },
        { value: 'ALL', label: 'All' },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Listing Requests</h1>
                <p className="text-slate-500 text-sm mt-1">Users who want to list their items on the platform.</p>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            statusFilter === f.value
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                        }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No listing requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const isExpanded = expandedId === request.id;
                        return (
                            <div key={request.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {request.user?.profile_image ? (
                                            <img src={request.user.profile_image} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                                                {request.user?.first_name?.[0]}{request.user?.last_name?.[0]}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900 truncate">
                                                    {request.user?.first_name} {request.user?.last_name}
                                                </h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[request.status]}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin size={12} /> {request.city} • {formatDate(request.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {isExpanded
                                        ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                                        : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                                    }
                                </button>

                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                        {/* User info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                                            <p className="flex items-center gap-2 text-slate-600">
                                                <Mail size={14} className="text-gray-400" /> {request.user?.email}
                                            </p>
                                            {request.user?.phone_number && (
                                                <p className="flex items-center gap-2 text-slate-600">
                                                    <Phone size={14} className="text-gray-400" /> {request.user?.phone_number}
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2 text-slate-600">
                                                <MessageCircle size={14} className="text-gray-400" />
                                                WhatsApp: {request.whatsapp}
                                            </p>
                                            <p className="flex items-center gap-2 text-slate-600">
                                                <MapPin size={14} className="text-gray-400" /> {request.city}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <p className="text-xs font-medium text-gray-400 mb-2">WHAT THEY WANT TO LIST</p>
                                            <p className="text-sm text-slate-700">{request.description}</p>
                                        </div>

                                        {/* WhatsApp CTA */}
                                        <a
                                            href={`https://wa.me/${request.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors mb-4">
                                            <MessageCircle size={16} />
                                            Contact on WhatsApp
                                        </a>

                                        {/* Status actions */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['CONTACTED', 'CONVERTED', 'DECLINED'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleUpdateStatus(request.id, s)}
                                                    disabled={actionLoading === request.id || request.status === s}
                                                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                                                        s === 'CONVERTED'
                                                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                            : s === 'DECLINED'
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                    }`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}