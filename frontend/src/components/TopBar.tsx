import { Bell, ChevronDown, Sun, Moon, ShieldCheck, Sparkles } from 'lucide-react';
import { useCollege } from '../contexts/CollegeContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import PulseSelector from './profile/PulseSelector';

const TopBar = () => {
    const { activeCollege, setActiveCollege, allColleges } = useCollege();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4 px-6 z-40 transition-colors">
            <div className="max-w-md mx-auto flex items-center justify-between relative">
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold transition-colors"
                    >
                        <span className="bg-slate-100 dark:bg-white/10 p-1 rounded-md text-xs">🎓</span>
                        <span className="truncate max-w-[150px]">{activeCollege?.name || 'Select College'}</span>
                        <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 transition-colors"
                            >
                                {allColleges.length > 0 ? allColleges.map((college) => (
                                    <button
                                        key={college.id}
                                        onClick={() => {
                                            setActiveCollege(college);
                                            setIsOpen(false);
                                        }}
                                        className={clsx(
                                            "w-full text-left px-4 py-3 text-sm transition-colors",
                                            activeCollege?.id === college.id
                                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        {college.name}
                                    </button>
                                )) : (
                                    <div className="px-4 py-2 text-xs text-slate-500">No colleges associated</div>
                                )}
                                <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-2">
                                    <button
                                        onClick={() => {
                                            navigate('/discover', { state: { initialTab: 'colleges' } });
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        + Add your college
                                    </button>
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => {
                                                navigate('/admin/requests');
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                                        >
                                            <ShieldCheck size={14} /> Admin Portal
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                    <PulseSelector />
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-slate-600" />}
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 bg-blue-500/5 dark:bg-blue-400/10 px-3 py-1.5 rounded-2xl border border-blue-500/10 dark:border-blue-400/20">
                        <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-blue-300/80 uppercase tracking-wider">{user?.tierLevel || 'Identity'}</span>
                        <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-0.5" />
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{user?.reputationScore || 0}</span>
                    </div>

                    <Link to="/notifications" className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
