import { useEffect, useState } from 'react';
import { CreditCard, Search } from 'lucide-react';
import api from '../api/axios';


const typeColors = {
    RENTAL: 'bg-blue-100 text-blue-700',
    DEPOSIT: 'bg-purple-100 text-purple-700',
    SUBSCRIPTION: 'bg-pink-100 text-pink-700',
};

const statusColors = {
    SUCCESS: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
};

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                ...(typeFilter !== 'ALL' && { type: typeFilter }),
                ...(statusFilter !== 'ALL' && { status: statusFilter }),
            };
            const res = await api.get('/admin/payments', { params });
            setPayments(res.data.data.payments);
            setTotal(res.data.data.total);
        } catch (err) {
            setError('Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [typeFilter, statusFilter, page]);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const totalPages = Math.ceil(total / limit);

    const totalSuccessAmount = payments
        .filter(p => p.status === 'SUCCESS')
        .reduce((acc, p) => acc + parseFloat(p.amount), 0);

    const typeFilters = ['ALL', 'RENTAL', 'DEPOSIT', 'SUBSCRIPTION'];
    const statusFilters = ['ALL', 'SUCCESS', 'PENDING', 'FAILED'];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Payments Ledger</h1>
                <p className="text-slate-500 text-sm mt-1">{total} total transaction(s)</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Transactions', value: total, color: 'text-slate-900' },
                    { label: 'Successful', value: payments.filter(p => p.status === 'SUCCESS').length, color: 'text-green-600' },
                    { label: 'Pending', value: payments.filter(p => p.status === 'PENDING').length, color: 'text-yellow-600' },
                    { label: 'Revenue (page)', value: `${totalSuccessAmount.toLocaleString()} CFA`, color: 'text-blue-600' },
                ].map((card) => (
                    <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 font-medium mb-1">{card.label}</p>
                        <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex gap-2 overflow-x-auto">
                    {typeFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => { setTypeFilter(f); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                typeFilter === f
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                            }`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {statusFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => { setStatusFilter(f); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                statusFilter === f
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                            }`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : payments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <CreditCard size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No transactions found.</p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Reference</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <tr
                                            key={payment.id}
                                            className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900">
                                                    {payment.user?.first_name} {payment.user?.last_name}
                                                </p>
                                                <p className="text-xs text-gray-400">{payment.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[payment.type]}`}>
                                                    {payment.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {parseFloat(payment.amount).toLocaleString()} CFA
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[payment.status]}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]">
                                                    {payment.transaction_reference ?? '—'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {formatDate(payment.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40">
                                Previous
                            </button>
                            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40">
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}