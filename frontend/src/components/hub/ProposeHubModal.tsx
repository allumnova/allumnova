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
    const [category, setCategory] = useState('COLLEGE');
    const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC' | 'SOCIETY' | 'HIDDEN'>('PUBLIC');

    const handleSubmit = async () => {
        if (!name || !description || !activeCollege) return;
        setLoading(true);
        try {
            await api.post('/environments', {
                name,
                description,
                privacyLevel,
                type: 'HUB',
                category,
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

    const environmentCategories = [
        { value: 'COLLEGE', label: 'College / University Environment' },
        { value: 'CITY', label: 'City / Local Community Environment' },
        { value: 'PROFESSION', label: 'Profession / Industry Environment' },
        { value: 'INTEREST', label: 'Interest / Hobby Environment' },
        { value: 'CAREER', label: 'Career / Skill Community Environment' },
        { value: 'LIFESTYLE', label: 'Lifestyle / Social Environment' },
        { value: 'EVENT', label: 'Event-Based Environment' },
        { value: 'PRIVATE', label: 'Private Community Environment' },
        { value: 'ORGANIZATION', label: 'Organization / Brand Community' }
    ];

    const privacyOptions = [
        { 
            id: 'PUBLIC', 
            label: 'Public Access', 
            icon: <Globe size={18} />, 
            desc: 'Visible to everyone. Open joining.' 
        },
        { 
            id: 'SOCIETY', 
            label: 'Vetted Access', 
            icon: <Shield size={18} />, 
            desc: 'Visible, but requires application approval.' 
        },
        { 
            id: 'HIDDEN', 
            label: 'Private / Invite Only', 
            icon: <Lock size={18} />, 
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
                        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[200]"
                    />
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                                            <Plus size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Propose New Space</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Step {step} of 2</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                                        <X size={18} />
                                    </button>
                                </div>

                                {step === 1 ? (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Space Type / Category</label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            >
                                                {environmentCategories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Space Name</label>
                                            <input 
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="e.g. Kanpur Startup Circle"
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Mission & Description</label>
                                            <textarea 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="What is the key purpose of this space?"
                                                rows={4}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => name && description && setStep(2)}
                                            disabled={!name || !description}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-30 transition-all shadow-sm"
                                        >
                                            Continue to Access Protocols
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Access Protocol</label>
                                            <div className="space-y-3">
                                                {privacyOptions.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setPrivacyLevel(opt.id as any)}
                                                        className={clsx(
                                                            "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                                            privacyLevel === opt.id 
                                                                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 text-blue-900 dark:text-blue-100" 
                                                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        <div className={clsx("p-2 rounded-lg", privacyLevel === opt.id ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-white/10")}>
                                                            {opt.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={clsx("text-xs font-bold", privacyLevel === opt.id ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white")}>{opt.label}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-xl font-bold uppercase tracking-wider text-xs"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm"
                                            >
                                                {loading ? 'Submitting...' : 'Submit Space'}
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
