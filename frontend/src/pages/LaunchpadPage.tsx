import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Plus, Filter, Search, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { Project } from '../types';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal from '../components/project/CreateProjectModal';

const LaunchpadPage = () => {
    const { user } = useAuth();
    const { activeCollege } = useCollege();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'COLLABORATORS'>('ALL');

    const fetchProjects = async () => {
        if (!activeCollege) return;
        setLoading(true);
        try {
            const res = await api.get(`/projects/college/${activeCollege.id}`);
            if (res.data.success) {
                setProjects(res.data.projects);
            }
        } catch (error) {
            console.error('Fetch projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [activeCollege]);

    const filteredProjects = filter === 'ALL' 
        ? projects 
        : projects.filter(p => p.lookingFor);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Rocket className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Launchpad</h1>
                    </motion.div>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                        Where {activeCollege?.name || 'College'} minds build the future. 
                        Showcase your projects, find co-founders, and get community hype.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-[2rem] font-bold shadow-xl transition-all"
                >
                    <Plus size={20} />
                    <span>Launch Project</span>
                </motion.button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        All Projects
                    </button>
                    <button 
                        onClick={() => setFilter('COLLABORATORS')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'COLLABORATORS' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Seeking Collaborators
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-white dark:bg-white/5 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-white/10" />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, idx) => (
                        <ProjectCard key={project.id} project={project} index={idx} onUpdate={fetchProjects} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
                    <div className="mb-6 opacity-20">
                        <Rocket size={80} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No projects launched yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">Be the first to showcase your innovation and get the community talking.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-500 transition-all">Start your journey</button>
                </div>
            )}

            <CreateProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchProjects();
                }}
            />
        </div>
    );
};

export default LaunchpadPage;
