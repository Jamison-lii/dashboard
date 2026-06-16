import { useEffect, useState } from 'react';
import { Search, Package, Plus, Edit2, Trash2, ChevronDown, ChevronUp, MapPin, X } from 'lucide-react';
import api from '../api/axios';
import ListingFormModal from '../components/ListingFormModal';
import ListingItemFormModal from '../components/ListingItemFormModal';

const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
};

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const [listingModalOpen, setListingModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState(null);

    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemListingId, setItemListingId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/listings', {
                params: { search: debouncedSearch }
            });
            setListings(res.data.data.listings);
        } catch (err) {
            setError('Failed to load listings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [debouncedSearch]);

    const handleDeleteListing = async (listingId) => {
        if (!confirm('Delete this listing and all its items? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/listings/${listingId}`);
            setListings((prev) => prev.filter((l) => l.id !== listingId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete listing.');
        }
    };

    const handleDeleteItem = async (listingId, itemId) => {
        if (!confirm('Delete this item?')) return;
        try {
            await api.delete(`/admin/listings/${listingId}/items/${itemId}`);
            setListings((prev) =>
                prev.map((l) =>
                    l.id === listingId
                        ? { ...l, listing_items: l.listing_items.filter((i) => i.id !== itemId) }
                        : l
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete item.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Listings</h1>
                    <p className="text-slate-500 text-sm mt-1">{listings.length} listing(s)</p>
                </div>
                <button
                    onClick={() => { setEditingListing(null); setListingModalOpen(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                    <Plus size={16} /> New Listing
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, category or city..."
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : listings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <Package size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-slate-500">No listings found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => {
                        const isExpanded = expandedId === listing.id;
                        return (
                            <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[listing.status]}`}>
                                                {listing.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <MapPin size={12} /> {listing.location_city} • {listing.category} • {listing.listing_items?.length ?? 0} item(s)
                                        </p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-2" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />}
                                </button>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                        <p className="text-sm text-slate-600 mb-4">{listing.description}</p>

                                        {/* Listing actions */}
                                        <div className="flex gap-2 mb-5">
                                            <button
                                                onClick={() => { setEditingListing(listing); setListingModalOpen(true); }}
                                                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                                <Edit2 size={14} /> Edit Listing
                                            </button>
                                            <button
                                                onClick={() => handleDeleteListing(listing.id)}
                                                className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                                <Trash2 size={14} /> Delete Listing
                                            </button>
                                        </div>

                                        {/* Items */}
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Items</p>
                                            <button
                                                onClick={() => {
                                                    setEditingItem(null);
                                                    setItemListingId(listing.id);
                                                    setItemModalOpen(true);
                                                }}
                                                className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline">
                                                <Plus size={14} /> Add Item
                                            </button>
                                        </div>

                                        {listing.listing_items?.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic">No items yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {listing.listing_items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {item.image ? (
                                                                <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                    <Package size={18} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {item.price_per_day ? `${item.price_per_day} CFA/day` : `${item.price_per_hour} CFA/hr`} • Qty: {item.quantity_available}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingItem(item);
                                                                    setItemListingId(listing.id);
                                                                    setItemModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(listing.id, item.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {listingModalOpen && (
                <ListingFormModal
                    listing={editingListing}
                    onClose={() => setListingModalOpen(false)}
                    onSaved={(newListing) => {
                        setListingModalOpen(false);
                        if (editingListing) {
                            setListings((prev) => prev.map((l) => (l.id === newListing.id ? { ...l, ...newListing } : l)));
                        } else {
                            setListings((prev) => [{ ...newListing, listing_items: [] }, ...prev]);
                        }
                    }}
                />
            )}

            {itemModalOpen && (
                <ListingItemFormModal
                    item={editingItem}
                    listingId={itemListingId}
                    onClose={() => setItemModalOpen(false)}
                    onSaved={(newItem) => {
                        setItemModalOpen(false);
                        setListings((prev) =>
                            prev.map((l) => {
                                if (l.id !== itemListingId) return l;
                                if (editingItem) {
                                    return { ...l, listing_items: l.listing_items.map((i) => (i.id === newItem.id ? newItem : i)) };
                                }
                                return { ...l, listing_items: [...(l.listing_items ?? []), newItem] };
                            })
                        );
                    }}
                />
            )}
        </div>
    );
}