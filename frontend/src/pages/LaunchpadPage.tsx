import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Plus, Search, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import api from '../api/axios';
import { Project } from '../types';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal from '../components/project/CreateProjectModal';
import CreatePostModal from '../components/CreatePostModal';
import DiscoveryHub from '../components/social/DiscoveryHub';

const LaunchpadPage = () => {
    const { user } = useAuth();
    const { activeCollege } = useCollege();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'workspace'>('all');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showcaseProject, setShowcaseProject] = useState<any>(null);
    const location = useLocation();

    // Handle Elite Showcase gateway trigger from Profile
    useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsModalOpen(true);
            // Clear the state so it doesn't re-open on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchProjects = async (search?: string) => {
        if (!activeCollege) return;
        setLoading(true);
        try {
            const res = await api.get(`/projects/college/${activeCollege.id}`, {
                params: { search: search || undefined }
            });
            if (res.data.success) {
                let processedProjects = res.data.projects;
                if (Array.isArray(processedProjects)) {
                    // Client-side sorting/filtering based on tabs
                    if (activeTab === 'trending') {
                        processedProjects = [...processedProjects].sort((a, b) => (b.hypeScore || 0) - (a.hypeScore || 0));
                    } else if (activeTab === 'workspace') {
                        processedProjects = processedProjects.filter((p: any) => p.ownerId === user?.id);
                    }
                } else {
                    processedProjects = [];
                }

                setProjects(processedProjects);
            }
        } catch (error) {
            console.error('Fetch projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects(searchTerm);
    }, [activeCollege, searchTerm, activeTab]);

    const filteredProjects = projects; // Filtering handled in fetchProjects for these specific tabs

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Creative Header */}
            <div className="relative mb-16 p-12 rounded-[3.5rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Rocket size={200} className="text-blue-500 rotate-12" />
                </div>
                <div className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Rocket className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-blue-500 decoration-4 underline-offset-8">Launchpad</h1>
                        </div>
                    </motion.div>
                    <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed mb-8">
                        The ultimate stage for {activeCollege?.name || 'College'} innovation. 
                        Build, showcase, and get the hype your ideas deserve.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
                    >
                        <Plus size={18} />
                        <span>Launch New Initiative</span>
                    </motion.button>
                </div>
            </div>

            <div className="mb-16">
                <DiscoveryHub />
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/10 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Discovery', icon: Search },
                        { id: 'trending', label: 'Trending Hype', icon: Zap },
                        { id: 'workspace', label: 'My Workspace', icon: Rocket }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                activeTab === tab.id 
                                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl ring-1 ring-slate-200 dark:ring-white/10" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <tab.icon size={14} className={activeTab === tab.id ? "text-blue-500" : ""} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search initiatives & tech..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    />
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
                    {Array.isArray(projects) && projects.map((project: Project, idx: number) => (
                        <ProjectCard 
                            key={project.id} 
                            project={project} 
                            index={idx} 
                            onUpdate={() => fetchProjects(searchTerm)} 
                            onEdit={(p) => {
                                setEditingProject(p);
                                setIsModalOpen(true);
                            }}
                            onShare={(p) => {
                                setShowcaseProject(p);
                                setIsPostModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
                    <div className="mb-6 opacity-20">
                        <Rocket size={80} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No projects launched yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">Be the first to showcase your innovation and get the community talking.</p>
                    <button onClick={() => { setEditingProject(undefined); setIsModalOpen(true); }} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-500 transition-all">Start your journey</button>
                </div>
            )}

            <CreateProjectModal 
                isOpen={isModalOpen} 
                project={editingProject}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(undefined);
                }} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    setEditingProject(undefined);
                    fetchProjects(searchTerm);
                }}
            />

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSuccess={() => {
                    setIsPostModalOpen(false);
                    fetchProjects(searchTerm);
                }}
                initialData={showcaseProject}
            />
        </div>
    );
};

export default LaunchpadPage;
