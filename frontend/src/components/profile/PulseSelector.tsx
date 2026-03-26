import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Zap, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

const PREDEFINED_PULSES = [
    { label: 'Building', emoji: '🚀' },
    { label: 'Learning', emoji: '📚' },
    { label: 'Mentoring', emoji: '🧭' },
    { label: 'Hiring', emoji: '🔍' },
    { label: 'Open to Coffee', emoji: '☕' },
    { label: 'Focused', emoji: '🎯' },
];

const PulseSelector = () => {
    const { user, setUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdatePulse = async (pulse: string, emoji: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.put('/profile/pulse', { pulse, pulseEmoji: emoji });
            if (res.data.success) {
                // Update local user state
                setUser({ ...user, pulse, pulseEmoji: emoji });
                setIsOpen(false);
            }
        } catch (err) {
            console.error('Failed to update pulse:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearPulse = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.put('/profile/pulse', { pulse: null, pulseEmoji: null });
            if (res.data.success) {
                setUser({ ...user, pulse: null, pulseEmoji: null });
                setIsOpen(false);
            }
        } catch (err) {
            console.error('Failed to clear pulse:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300",
                    user?.pulse 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" 
                        : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                )}
            >
                {user?.pulseEmoji ? (
                    <span className="text-sm">{user.pulseEmoji}</span>
                ) : (
                    <Zap size={14} className={user?.pulse ? "text-amber-500" : "text-slate-400"} />
                )}
                {user?.pulse && <span className="text-[10px] font-bold uppercase tracking-tight hidden md:block">{user.pulse}</span>}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl p-4 z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Set your Pulse</h3>
                                {user?.pulse && (
                                    <button onClick={clearPulse} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-400">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {PREDEFINED_PULSES.map((p) => (
                                    <button
                                        key={p.label}
                                        disabled={loading}
                                        onClick={() => handleUpdatePulse(p.label, p.emoji)}
                                        className={clsx(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 group relative",
                                            user?.pulse === p.label
                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                                : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-amber-500/20 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <span className="text-xl mb-1 group-hover:scale-125 transition-transform">{p.emoji}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-tighter">{p.label}</span>
                                        {user?.pulse === p.label && (
                                            <div className="absolute top-1 right-1">
                                                <Check size={10} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                                <p className="text-[8px] text-slate-400 uppercase text-center font-bold tracking-widest">Broadcasts to your college instantly</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PulseSelector;
