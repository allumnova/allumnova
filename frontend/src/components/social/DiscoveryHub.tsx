import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Rocket, ShieldCheck, ChevronRight, Info, BrainCircuit } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

interface DiscoveryBrief {
    briefing: string;
    peers: any[];
    societies: any[];
    projects: any[];
}

const DiscoveryHub: React.FC = () => {
    const [brief, setBrief] = useState<DiscoveryBrief | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrief = async () => {
            try {
                const res = await api.get('/social/discovery-brief');
                setBrief(res.data);
            } catch (err) {
                console.error('Failed to fetch discovery brief', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrief();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-48 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse flex items-center justify-center">
                <BrainCircuit className="text-slate-300 dark:text-slate-700 animate-bounce" size={32} />
            </div>
        );
    }

    if (!brief) return null;

    return (
        <section className="space-y-6">
            {/* Header + AI Briefing */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-indigo-700 p-8 shadow-2xl shadow-purple-500/20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BrainCircuit size={120} className="text-white" />
                </div>
                
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Research Agentdiscovery Brief</h2>
                    </div>
                    
                    <p className="text-purple-100 text-sm font-bold leading-relaxed max-w-2xl italic">
                        "{brief.briefing}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Peer Recommendations */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">High-Signal Peers</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {brief.peers.map((peer) => (
                            <motion.div 
                                key={peer.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center gap-4 group transition-all"
                            >
                                <img src={peer.avatar || '/default-avatar.png'} alt={peer.name} className="w-10 h-10 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{peer.name}</h4>
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-tight truncate">{peer.matchReason}</p>
                                </div>
                                <Link to={`/profile/${peer.id}`} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
                                    <ChevronRight size={16} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Society Recommendations */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Aligned Societies</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {brief.societies.map((hub) => (
                            <motion.div 
                                key={hub.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center gap-4 group transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{hub.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{hub.memberCount} Professional Members</p>
                                </div>
                                <Link to={`/hubs/${hub.id}`} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <ChevronRight size={16} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Project Recommendations */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Rocket size={16} className="text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Skill-Match Projects</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {brief.projects.map((project) => (
                            <motion.div 
                                key={project.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center gap-4 group transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                                    {project.title[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{project.title}</h4>
                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight truncate">Seeking: {project.lookingFor}</p>
                                </div>
                                <Link to={`/projects/${project.id}`} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                    <ChevronRight size={16} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-4">
                <Info size={16} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                    Discovery Briefing leverages institutional signal data to assist in professional discovery. Matches are updated daily based on your active professional goals.
                </p>
            </div>
        </section>
    );
};

export default DiscoveryHub;
