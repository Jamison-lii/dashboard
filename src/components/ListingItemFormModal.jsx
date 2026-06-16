import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function ListingItemFormModal({ item, listingId, onClose, onSaved }) {
    const [formData, setFormData] = useState({
        name: item?.name ?? '',
        description: item?.description ?? '',
        quantity_available: item?.quantity_available ?? '',
        price_per_day: item?.price_per_day ?? '',
        price_per_hour: item?.price_per_hour ?? '',
        minimum_rental_duration: item?.minimum_rental_duration ?? '',
        maximum_rental_duration: item?.maximum_rental_duration ?? '',
        requires_verification: item?.requires_verification ?? false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.price_per_day && !formData.price_per_hour) {
            setError('Please provide at least one price (per day or per hour).');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== null) data.append(key, value);
            });
            if (imageFile) data.append('image', imageFile);

            if (item) {
                const res = await api.put(`/admin/listings/${listingId}/items/${item.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSaved(res.data.data.listingItem);
            } else {
                const res = await api.post(`/admin/listings/${listingId}/items`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSaved(res.data.data.listingItem);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="font-bold text-slate-900">{item ? 'Edit Item' : 'New Item'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="w-full text-sm"
                        />
                        {item?.image && !imageFile && (
                            <img src={item.image} alt="" className="w-20 h-20 rounded-lg object-cover mt-2" />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price / Day</label>
                            <input
                                name="price_per_day"
                                type="number"
                                value={formData.price_per_day}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price / Hour</label>
                            <input
                                name="price_per_hour"
                                type="number"
                                value={formData.price_per_hour}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                            <input
                                name="quantity_available"
                                type="number"
                                value={formData.quantity_available}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Min Days</label>
                            <input
                                name="minimum_rental_duration"
                                type="number"
                                value={formData.minimum_rental_duration}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Days</label>
                            <input
                                name="maximum_rental_duration"
                                type="number"
                                value={formData.maximum_rental_duration}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            name="requires_verification"
                            checked={formData.requires_verification}
                            onChange={handleChange}
                            className="rounded"
                        />
                        Requires identity verification to rent
                    </label>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}