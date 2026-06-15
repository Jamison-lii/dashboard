import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ShieldCheck,
    Package, Calendar, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rentals', icon: Calendar, label: 'Rentals' },
    { to: '/verifications', icon: ShieldCheck, label: 'Verifications' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/listings', icon: Package, label: 'Listings' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold text-white">RentIt</h1>
                <p className="text-slate-400 text-sm mt-1">Admin Dashboard</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }>
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}