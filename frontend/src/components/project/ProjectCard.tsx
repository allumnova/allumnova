import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Zap, Users, CheckCircle2, ChevronRight, Edit3, Trash2, Rocket } from 'lucide-react';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { clsx } from 'clsx';

interface ProjectCardProps {
    project: Project;
    index: number;
    onUpdate: () => void;
    onEdit: (project: Project) => void;
    onShare?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onUpdate, onEdit, onShare }) => {
    const { user } = useAuth();
    const [hyping, setHyping] = useState(false);
    const isOwner = user?.id === project.ownerId;

    const handleHype = async () => {
        setHyping(true);
        try {
            await api.post(`/projects/${project.id}/hype`);
            onUpdate();
        } catch (error) {
            console.error('Hype error:', error);
        } finally {
            setHyping(false);
        }
    };

    const handleToggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
        try {
            await api.patch(`/projects/milestones/${milestoneId}`, { isCompleted });
            onUpdate();
        } catch (error) {
            console.error('Milestone toggle error:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${project.id}`);
            onUpdate();
        } catch (error) {
            console.error('Delete project error:', error);
        }
    };

    const milestones = Array.isArray(project.milestones) ? project.milestones : [];
    const completedMilestones = (Array.isArray(milestones) ? milestones : []).filter(m => m && m.isCompleted).length;
    const progress = milestones.length > 0 
        ? (completedMilestones / milestones.length) * 100 
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
        >
            {/* Status Badge & Actions */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                {isOwner && (
                    <div className="flex bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/10 p-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Edit project"
                        >
                            <Edit3 size={14} />
                        </button>
                        {onShare && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onShare(project); }}
                                className="p-1.5 text-slate-400 hover:text-purple-500 transition-colors"
                                title="Broadcast to Feed"
                            >
                                <Rocket size={14} />
                            </button>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
                <div className={clsx(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-sm",
                    project.status === 'IDEA' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    project.status === 'BUILDING' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                    {project.status}
                </div>
            </div>

            <div className="p-8">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden ring-2 ring-slate-100 dark:ring-white/5">
                        {project.owner?.avatar && <img src={project.owner.avatar} alt={project.owner.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none mb-1">{project.owner?.name || 'Unknown User'}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-tighter">Reputation: {project.owner?.reputationScore || 0}</p>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{project.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">
                    {project.description}
                </p>

                {/* Milestones List (Toggleable for Owner) */}
                <div className="space-y-2 mb-6">
                    {(Array.isArray(milestones) ? milestones : []).map((m) => (
                        <div 
                            key={m.id}
                            onClick={(e) => {
                                if (isOwner) {
                                    e.stopPropagation();
                                    handleToggleMilestone(m.id, !m.isCompleted);
                                }
                            }}
                            className={clsx(
                                "flex items-center gap-2 text-[10px] font-bold py-1.5 px-3 rounded-xl border transition-all",
                                m.isCompleted 
                                    ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                                    : "bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-transparent",
                                isOwner && "hover:border-blue-500/30 cursor-pointer"
                            )}
                        >
                            <CheckCircle2 size={12} className={m.isCompleted ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} strokeWidth={3} />
                            <span className="truncate">{m.title}</span>
                        </div>
                    ))}
                </div>

                {/* Looking For */}
                {project.lookingFor && (
                    <div className="flex items-center gap-2 mb-6 p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Users size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Looking for: {project.lookingFor}</span>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex gap-2">
                        {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                        )}
                        {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <ExternalLink size={20} />
                            </a>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={hyping}
                        onClick={handleHype}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                            project.hasHyped 
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-amber-500 hover:text-white"
                        )}
                    >
                        <Zap size={14} className={project.hasHyped ? "fill-current" : ""} />
                        <span>Hype {project.hypeScore > 0 && `(${project.hypeScore})`}</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
