import React from 'react';
import { Sun, Moon, LogOut, ShieldAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4 px-6 z-40 transition-colors">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tight shadow-md shadow-blue-500/20">
                        A
                    </div>
                    <div>
                        <h1 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                            Allumnova
                        </h1>
                        <span className="text-[8px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                            Enterprise OS
                        </span>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggler */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Auth Status / Action */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {/* Role Badge */}
                            <span className="hidden sm:inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/10">
                                {user?.role || 'MEMBER'}
                            </span>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                                <LogOut size={12} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
