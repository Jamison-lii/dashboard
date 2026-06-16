import { useEffect, useState } from 'react';
import { Calendar, MapPin, Phone, Mail, Package, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

const statusColors = {
    REQUESTED: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('REQUESTED');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const res = await api.get('/admin/rentals', { params });
            setRentals(res.data.data.rentals);
        } catch (err) {
            setError('Failed to load rentals.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentals();
    }, [statusFilter]);

    const handleUpdateStatus = async (rentalId, status) => {
        setActionLoading(rentalId);
        try {
            await api.put(`/admin/rentals/${rentalId}/status`, { status });
            setRentals((prev) => prev.filter((r) => r.id !== rentalId || statusFilter === 'ALL'));
            setRentals((prev) =>
                prev.map((r) => (r.id === rentalId ? { ...r, status } : r))
            );
            if (statusFilter !== 'ALL') {
                setRentals((prev) => prev.filter((r) => r.id !== rentalId));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update rental.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const getRentalDays = (rental) => {
        const start = new Date(rental.start_date);
        const end = new Date(rental.end_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const filters = [
        { value: 'REQUESTED', label: 'Pending' },
        { value: 'ACCEPTED', label: 'Accepted' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'ALL', label: 'All' },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Rentals</h1>
                <p className="text-slate-500 text-sm mt-1">Review and manage rental requests.</p>
            </div>

            {/* Filter tabs */}
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
            ) : rentals.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <Package size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No rentals found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {rentals.map((rental) => {
                        const isExpanded = expandedId === rental.id;
                        return (
                            <div key={rental.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : rental.id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-slate-900 truncate">
                                                {rental.listing?.title ?? 'Rental'}
                                            </h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[rental.status]}`}>
                                                {rental.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {rental.user?.first_name} {rental.user?.last_name} • {rental.rental_items?.length} item(s) • {rental.total_price} CFA
                                        </p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-2" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />}
                                </button>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                        {/* Renter info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-xs font-medium text-gray-400 mb-2">RENTER</p>
                                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                                    {rental.user?.first_name} {rental.user?.last_name}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Mail size={14} /> {rental.user?.email}
                                                </p>
                                                {rental.user?.phone_number && (
                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <Phone size={14} /> {rental.user?.phone_number}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-xs font-medium text-gray-400 mb-2">RENTAL PERIOD</p>
                                                <p className="text-sm text-slate-900 flex items-center gap-1 mb-1">
                                                    <Calendar size={14} /> {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                                                </p>
                                                <p className="text-sm text-slate-500">{getRentalDays(rental)} day(s) • {rental.pickup_method}</p>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <p className="text-xs font-medium text-gray-400 mb-3">ITEMS</p>
                                            <div className="space-y-2">
                                                {rental.rental_items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-700">
                                                            {item.listing_item?.name ?? 'Item'} × {item.quantity}
                                                        </span>
                                                        <span className="font-medium text-slate-900">{item.price_applied} CFA</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-900">Total</span>
                                                <span className="text-base font-bold text-slate-900">{rental.total_price} CFA</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {rental.status === 'REQUESTED' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(rental.id, 'ACCEPTED')}
                                                    disabled={actionLoading === rental.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                                                    <Check size={16} />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(rental.id, 'REJECTED')}
                                                    disabled={actionLoading === rental.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                                                    <X size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
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