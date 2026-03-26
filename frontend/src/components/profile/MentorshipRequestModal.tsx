import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Award, Target } from 'lucide-react';
import api from '../../api/axios';

interface MentorshipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    alumniId: string;
    alumniName: string;
    onSuccess?: () => void;
}

const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({ 
    isOpen, 
    onClose, 
    alumniId, 
    alumniName,
    onSuccess 
}) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setError('');
        try {
            await api.post('/mentorship/request', { alumniId, message });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Request Mentorship</h2>
                                    <p className="text-slate-500 text-xs font-bold">Connecting with {alumniName}</p>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                                        <Award size={20} />
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                        A great request explains your goals and why you're interested workshop with this specific alumni.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Your Message</label>
                                    <textarea 
                                        rows={5}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="Hi! I am working on X and would love to get your advice on Y..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                {error && (
                                    <p className="text-rose-500 text-xs font-bold text-center">{error}</p>
                                )}

                                <button 
                                    type="submit"
                                    disabled={loading || !message.trim()}
                                    className="w-full bg-blue-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Mentor Request
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MentorshipRequestModal;
