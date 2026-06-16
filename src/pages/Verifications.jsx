import { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import api from '../api/axios';

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
};

export default function Verifications() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
            const res = await api.get('/admin/verifications', { params });
            setVerifications(res.data.data.verifications);
        } catch (err) {
            setError('Failed to load verifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, [statusFilter]);

    const handleReview = async (verificationId, status) => {
        setActionLoading(verificationId);
        try {
            await api.put(`/admin/verifications/${verificationId}/review`, { status });
            setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to review verification.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const filters = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'ALL', label: 'All' },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Verifications</h1>
                <p className="text-slate-500 text-sm mt-1">Review identity verification submissions.</p>
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
            ) : verifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <ShieldCheck size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No verifications found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {verifications.map((v) => {
                        const isExpanded = expandedId === v.id;
                        return (
                            <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {v.user?.profile_image ? (
                                            <img src={v.user.profile_image} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                                                {v.user?.first_name?.[0]}{v.user?.last_name?.[0]}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900 truncate">
                                                    {v.user?.first_name} {v.user?.last_name}
                                                </h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[v.status]}`}>
                                                    {v.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{v.user?.email} • {v.document_type}</p>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-2" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />}
                                </button>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                        <p className="text-xs font-medium text-gray-400 flex items-center gap-1 mb-3">
                                            <Calendar size={12} /> Submitted {formatDate(v.submitted_at)}
                                        </p>

                                        {/* Document images */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {[
                                                { label: 'Front', src: v.document_front },
                                                { label: 'Back', src: v.document_back },
                                                { label: 'Selfie', src: v.selfie_image },
                                            ].map(({ label, src }) => (
                                                <div key={label}>
                                                    <img
                                                        src={src}
                                                        alt={label}
                                                        onClick={() => setPreviewImage(src)}
                                                        className="w-full h-28 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1 text-center">{label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        {v.status === 'PENDING' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleReview(v.id, 'APPROVED')}
                                                    disabled={actionLoading === v.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                                                    <Check size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReview(v.id, 'REJECTED')}
                                                    disabled={actionLoading === v.id}
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

            {/* Image preview modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
                    onClick={() => setPreviewImage(null)}>
                    <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-lg" />
                </div>
            )}
        </div>
    );
}