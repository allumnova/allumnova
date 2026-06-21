import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, Send, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import clsx from 'clsx';

interface JoinRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    hubId: string;
    hubName: string;
    questions: string[];
    onSuccess?: () => void;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ 
    isOpen, 
    onClose, 
    hubId, 
    hubName, 
    questions = [], 
    onSuccess 
}) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const isComplete = questions.every(q => answers[q]?.trim());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (questions.length > 0 && !isComplete) return;

        setLoading(true);
        setError('');
        try {
            await api.post(`/environments/join/${hubId}`, { answers });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit application');
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
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                                            Membership Vetting
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Join {hubName}</h2>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed">This society requires a brief application to ensure high-signal community alignment.</p>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {questions.length > 0 ? (
                                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                                                    <Sparkles size={12} className="text-purple-500" />
                                                    Question {idx + 1}: {q}
                                                </label>
                                                <textarea 
                                                    value={answers[q] || ''}
                                                    onChange={e => handleAnswerChange(q, e.target.value)}
                                                    placeholder="Provide your high-signal response..."
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-900 dark:text-white resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Join this society to access curated projects, private events, and high-signal community spaces.</p>
                                    </div>
                                )}

                                {error && (
                                    <p className="text-rose-500 text-xs font-bold text-center animate-shake">{error}</p>
                                )}

                                <div className="space-y-3 pt-2">
                                    <button 
                                        type="submit"
                                        disabled={loading || (questions.length > 0 && !isComplete)}
                                        className={clsx(
                                            "w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
                                            (questions.length > 0 && !isComplete) 
                                                ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] shadow-slate-900/10"
                                        )}
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                {questions.length > 0 ? 'Submit Application' : 'Apply for Membership'}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Submissions are reviewed by society admins
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default JoinRequestModal;
