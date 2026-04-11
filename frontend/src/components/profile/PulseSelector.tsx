import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)} 
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">Your Pulse</h3>
                                    <div className="flex items-center gap-2">
                                        {user?.pulse && (
                                            <button onClick={clearPulse} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
                                                <X size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
                                            <Zap size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {PREDEFINED_PULSES.map((p) => (
                                        <button
                                            key={p.label}
                                            disabled={loading}
                                            onClick={() => handleUpdatePulse(p.label, p.emoji)}
                                            className={clsx(
                                                "flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300 group relative",
                                                user?.pulse === p.label
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-blue-500/20 text-slate-600 dark:text-slate-400"
                                            )}
                                        >
                                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500">{p.emoji}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                                            {user?.pulse === p.label && (
                                                <div className="absolute top-3 right-4">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <p className="text-[8px] text-slate-400 uppercase text-center font-black tracking-[0.2em] opacity-60">Broadcasts to your institutional network instantly</p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default PulseSelector;
