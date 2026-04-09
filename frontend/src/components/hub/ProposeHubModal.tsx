import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Globe, Lock, Info, Plus, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../api/axios';
import { useCollege } from '../../contexts/CollegeContext';

interface ProposeHubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProposeHubModal: React.FC<ProposeHubModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { activeCollege } = useCollege();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC' | 'SOCIETY' | 'HIDDEN'>('PUBLIC');
    const [type, setType] = useState('HUB');

    const handleSubmit = async () => {
        if (!name || !description || !activeCollege) return;
        setLoading(true);
        try {
            await api.post('/environments', {
                name,
                description,
                privacyLevel,
                type,
                collegeId: activeCollege.id
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Proposal error:', error);
        } finally {
            setLoading(false);
        }
    };

    const privacyOptions = [
        { 
            id: 'PUBLIC', 
            label: 'Public Society', 
            icon: <Globe size={20} />, 
            desc: 'Visible to everyone. Open joining.' 
        },
        { 
            id: 'SOCIETY', 
            label: 'Vetted Society', 
            icon: <Shield size={20} />, 
            desc: 'Visible, but requires application approval.' 
        },
        { 
            id: 'HIDDEN', 
            label: 'Hidden Lab', 
            icon: <Lock size={20} />, 
            desc: 'Not visible in search. Invite only.' 
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200]"
                    />
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="w-full max-w-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-3xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 text-white">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Propose Hub</h2>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Step {step} of 2</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                {step === 1 ? (
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Community Identity</label>
                                            <input 
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="e.g. AI Research Lab"
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission & Purpose</label>
                                            <textarea 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="What is the pure goal of this community?"
                                                rows={4}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => name && description && setStep(2)}
                                            disabled={!name || !description}
                                            className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-30 group transition-all"
                                        >
                                            Select Privacy Tiers
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label>
                                            <div className="space-y-4">
                                                {privacyOptions.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setPrivacyLevel(opt.id as any)}
                                                        className={clsx(
                                                            "w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left",
                                                            privacyLevel === opt.id 
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20" 
                                                                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        <div className={clsx("p-3 rounded-xl", privacyLevel === opt.id ? "bg-white/20" : "bg-slate-200 dark:bg-white/10")}>
                                                            {opt.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={clsx("text-xs font-black uppercase tracking-tight", privacyLevel === opt.id ? "text-white" : "text-slate-900 dark:text-white")}>{opt.label}</p>
                                                            <p className={clsx("text-[10px] font-bold mt-0.5", privacyLevel === opt.id ? "text-white/70" : "text-slate-400")}>{opt.desc}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-6 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-[2rem] font-black uppercase tracking-widest text-xs"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-[2] bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20"
                                            >
                                                {loading ? 'Submitting...' : 'Submit Proposal'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProposeHubModal;
