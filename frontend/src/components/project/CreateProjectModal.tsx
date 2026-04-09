import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Plus, Trash2, Github, Search } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../api/axios';
import { useCollege } from '../../contexts/CollegeContext';
import { Project } from '../../types';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project?: Project;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
    const { activeCollege } = useCollege();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(project?.title || '');
    const [description, setDescription] = useState(project?.description || '');
    const [repoUrl, setRepoUrl] = useState(project?.repoUrl || '');
    const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '');
    const [lookingFor, setLookingFor] = useState(project?.lookingFor || '');
    const [milestones, setMilestones] = useState<string[]>(
        (Array.isArray(project?.milestones) ? project!.milestones : []).map(m => m.title) || ['Initial concept', 'MVP Development']
    );
    const [shareToFeed, setShareToFeed] = useState(true);

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description || '');
            setRepoUrl(project.repoUrl || '');
            setDemoUrl(project.demoUrl || '');
            setLookingFor(project.lookingFor || '');
            setMilestones((Array.isArray(project.milestones) ? project.milestones : []).map(m => m.title));
        } else {
            setTitle('');
            setDescription('');
            setRepoUrl('');
            setDemoUrl('');
            setLookingFor('');
            setMilestones(['Initial concept', 'MVP Development']);
        }
    }, [project, isOpen]);

    const addMilestone = () => setMilestones([...milestones, '']);
    const updateMilestone = (index: number, val: string) => {
        const newMilestones = [...milestones];
        newMilestones[index] = val;
        setMilestones(newMilestones);
    };
    const removeMilestone = (index: number) => setMilestones((Array.isArray(milestones) ? milestones : []).filter((_, i: number) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !activeCollege) return;

        setLoading(true);
        try {
            const data = {
                title,
                description,
                repoUrl,
                demoUrl,
                lookingFor,
                milestones: (Array.isArray(milestones) ? milestones : []).filter(m => m && m.trim()).map(m => ({ title: m, isCompleted: false })),
                collegeId: activeCollege.id,
                shareToFeed: project ? false : shareToFeed // Only auto-share on new projects
            };

            if (project) {
                await api.patch(`/projects/${project.id}`, data);
            } else {
                await api.post('/projects', data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Launch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100]"
                    />
                    <div className="fixed inset-0 z-[101] overflow-y-auto pt-20 pb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20">
                                            <Rocket className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Launch Project</h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Share your innovation with {activeCollege?.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Basics */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                                            <input 
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder="e.g. Allumnova Mobile"
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                            <textarea 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="What are you building and why?"
                                                rows={4}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl px-6 py-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Links & Help */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                                <Github size={12} /> GitHub URL
                                            </label>
                                            <input 
                                                value={repoUrl}
                                                onChange={e => setRepoUrl(e.target.value)}
                                                placeholder="https://github.com/..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs dark:text-white tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                                <Search size={12} /> Seeking
                                            </label>
                                            <input 
                                                value={lookingFor}
                                                onChange={e => setLookingFor(e.target.value)}
                                                placeholder="Designers, Co-founders..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    {/* Milestones */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Roadmap Milestones</label>
                                            <button type="button" onClick={addMilestone} className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                                                <Plus size={12} /> Add Step
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {milestones.map((m, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                                                        <input 
                                                            value={m}
                                                            onChange={e => updateMilestone(i, e.target.value)}
                                                            placeholder={`Milestone ${i + 1}`}
                                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold dark:text-white"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeMilestone(i)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Social Loop */}
                                    {!project && (
                                        <div className="flex items-center justify-between p-5 bg-blue-600/5 rounded-3xl border border-blue-600/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                                                    <Rocket size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Signal Arrival</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automagically share this launch to the campus feed</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setShareToFeed(!shareToFeed)}
                                                className={clsx(
                                                    "w-12 h-6 rounded-full transition-all relative outline-none",
                                                    shareToFeed ? "bg-blue-600" : "bg-slate-200 dark:bg-white/10"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    shareToFeed ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !title || !description}
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Launching...' : 'Initialize Launch'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateProjectModal;
