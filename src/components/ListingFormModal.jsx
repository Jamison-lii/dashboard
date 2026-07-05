import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import api from '../api/axios';

export default function ListingFormModal({ listing, onClose, onSaved }) {
    const [formData, setFormData] = useState({
        user_id: listing?.user_id ?? '',
        title: listing?.title ?? '',
        description: listing?.description ?? '',
        category: listing?.category ?? '',
        location_city: listing?.location_city ?? '',
        location_address: listing?.location_address ?? '',
        status: listing?.status ?? 'ACTIVE',
    });
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users', {
                    params: { search: userSearch, limit: 10 }
                });
                setUsers(res.data.data.users);
            } catch (err) {
                console.error('Failed to fetch users');
            }
        };
        fetchUsers();
    }, [userSearch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!listing && !formData.user_id) {
            setError('Please select an owner for this listing.');
            return;
        }

        setLoading(true);
        try {
            if (listing) {
                const res = await api.put(`/admin/listings/${listing.id}`, formData);
                onSaved(res.data.data.listing);
            } else {
                const res = await api.post('/admin/listings', formData);
                onSaved(res.data.data.listing);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save listing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="font-bold text-slate-900">{listing ? 'Edit Listing' : 'New Listing'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Owner selector — only when creating */}
                    {!listing && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Owner <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mb-2">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                />
                            </div>
                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                required>
                                <option value="">Select owner</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.first_name} {u.last_name} — {u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <input name="category" value={formData.category} onChange={handleChange} placeholder="Electronics, Vehicles, Events..." className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input name="location_city" value={formData.location_city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input name="location_address" value={formData.location_address} onChange={handleChange} placeholder="Used to auto-fetch coordinates" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" required />
                    </div>

                    {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : listing ? 'Save Changes' : 'Create Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}