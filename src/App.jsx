import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Rentals from './pages/Rentals';
import Verifications from './pages/Verifications';
import Users from './pages/Users';
import Listings from './pages/Listings';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    if (!user || !user.is_admin) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar — mobile only */}
                <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-600 hover:text-slate-900 transition-colors">
                        <Menu size={22} />
                    </button>
                    <h1 className="text-base font-bold text-slate-900">RentIt Admin</h1>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/rentals" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
                    <Route path="/verifications" element={<ProtectedRoute><Verifications /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}