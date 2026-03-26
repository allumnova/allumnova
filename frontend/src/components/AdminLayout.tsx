import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
    LayoutDashboard, Users, UserCheck, ShieldCheck, Settings,
    LogOut, Sun, Moon, Bell, Building
} from 'lucide-react';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        logout();
        queryClient.clear();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: UserCheck, label: 'Requests', path: '/admin/requests' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Building, label: 'Colleges', path: '/admin/colleges' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar for Desktop / Tablet */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 h-screen sticky top-0">
                <div className="p-6">
                    <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <ShieldCheck size={24} />
                        ADMIN
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                )
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-medium transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Admin Top Navbar */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4 px-6 z-40 sticky top-0 flex items-center justify-between md:justify-end shrink-0">
                    <div className="md:hidden flex items-center gap-2">
                        <ShieldCheck size={24} className="text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-slate-900 dark:text-white">Admin Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95 bg-slate-100 dark:bg-white/5 rounded-full"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-slate-600" />}
                        </button>
                        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Admin Nav Bottom */}
                <nav className="md:hidden mt-auto shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-safe pt-2 px-4 flex justify-between">
                    {navItems.slice(0, 4).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors duration-200 mb-2",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                                        : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                )
                            }
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors duration-200 mb-2 text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                        <LogOut size={20} />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </nav>
            </main>
        </div>
    );
};

export default AdminLayout;
