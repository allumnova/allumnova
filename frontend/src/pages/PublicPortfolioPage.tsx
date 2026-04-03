import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { 
    Download, 
    Linkedin, 
    Globe, 
    ExternalLink, 
    GraduationCap, 
    Briefcase, 
    Code, 
    Award, 
    ChevronRight, 
    CheckCircle2, 
    User,
    Mail,
    Phone,
    MapPin,
    Layers,
    Rocket
} from 'lucide-react';

const PublicPortfolioPage = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        window.print();
        setTimeout(() => setDownloading(false), 2000);
    };

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await api.get(`/profile/u/${username}`);
                setProfile(res.data.data);
            } catch (err) {
                console.error('Failed to fetch portfolio:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-4">404</h1>
                <p className="text-slate-400 mb-8">This portfolio hasn't been claimed yet or is private.</p>
                <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold">Back to Allumnova</Link>
            </div>
        );
    }

    // Get primary college color or default
    const accentColor = profile.colleges?.[0]?.college?.primaryColor || '#3b82f6';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            {/* Minimal Header / Action Bar */}
            <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none print:hidden">
                <Link to="/" className="pointer-events-auto bg-slate-900/50 backdrop-blur-xl border border-white/5 p-3 rounded-2xl">
                    <Rocket className="text-blue-500" size={24} />
                </Link>
                <button 
                    onClick={handleDownload}
                    className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Download size={18} />
                    {downloading ? 'Preparing...' : 'Download CV'}
                </button>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                    {/* Hero Section / Profile Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                        
                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-2xl">
                                <div className="w-full h-full bg-slate-950 rounded-[3.2rem] overflow-hidden p-0.5">
                                    <img 
                                        src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                                        className="w-full h-full object-cover rounded-[3.1rem]" 
                                        alt={profile.name} 
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{profile.name}</h1>
                                        {profile.is_verified && <CheckCircle2 size={24} className="text-blue-500" />}
                                    </div>
                                    <p className="text-xl text-slate-400 font-medium">{profile.department} • {profile.colleges?.[0]?.college?.name}</p>
                                </div>
                                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-medium opacity-80">
                                    {profile.bio || "Crafting the future through innovation and collaboration."}
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    {profile.linkedIn && (
                                        <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-2xl transition-all font-bold text-sm">
                                            <Linkedin size={18} className="text-blue-400" /> LinkedIn
                                        </a>
                                    )}
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-sm font-bold opacity-60">
                                        <MapPin size={18} /> {profile.location || 'Remote / India'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats / Quick Info */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 flex flex-col justify-between text-white shadow-2xl shadow-blue-500/20"
                    >
                        <div className="space-y-6">
                            <Layers size={40} className="opacity-50" />
                            <h3 className="text-2xl font-black leading-tight">Digital Reputation & Influence</h3>
                        </div>
                        <div className="pt-10">
                            <p className="text-6xl font-black">{profile.reputationScore || 0}</p>
                            <p className="text-sm font-black uppercase tracking-widest opacity-60 mt-2">Impact Points</p>
                        </div>
                    </motion.div>

                    {/* Experience Grid Section */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-6 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Briefcase className="text-blue-500" />
                                Experience
                            </h2>
                        </div>
                        <div className="space-y-8">
                            {profile.experience?.length > 0 ? profile.experience.map((exp: any, i: number) => (
                                <div key={i} className="relative pl-8 border-l border-white/10 last:border-0 pb-8 last:pb-0">
                                    <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-1.5 mt-1.5 shadow-lg shadow-blue-500/50" />
                                    <h4 className="text-lg font-bold text-white leading-none">{exp.position}</h4>
                                    <p className="text-blue-500 font-bold text-sm mt-1">{exp.company}</p>
                                    <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">
                                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-slate-400 text-sm mt-4 leading-relaxed line-clamp-3 italic">
                                        {exp.description}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-slate-600 italic">Professional records pending authentication.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Skills Grid */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-6 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col"
                    >
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                            <Code className="text-emerald-500" />
                            Stacks & Skills
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {(profile.skills?.length > 0 ? profile.skills : ['Innovation', 'Leadership', 'Communication']).map((skill: string) => (
                                <span key={skill} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-colors hover:bg-emerald-500/20 cursor-default">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <div className="mt-auto pt-10">
                            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 rounded-3xl border border-emerald-500/10">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-2">Top Recommendation</p>
                                <p className="text-slate-300 font-medium">Endorsed for technical excellence and collaborative problem solving.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Projects Showcase (Full Width Grid) */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-12"
                    >
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                <Rocket className="text-purple-500" />
                                Project Showcase
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {profile.projects?.length > 0 ? profile.projects.map((project: any) => (
                                <div key={project.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 group hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                            <Globe size={24} />
                                        </div>
                                        <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-3">{project.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">
                                        {project.description}
                                    </p>
                                    <div className="flex gap-4">
                                        {project.repoUrl && (
                                            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 underline underline-offset-4">Repo</a>
                                        )}
                                        {project.demoUrl && (
                                            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 underline underline-offset-4">Live Demo</a>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="md:col-span-3 py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No collaborative works showcased yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Education Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="md:col-span-12 bg-slate-900 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row gap-10 items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-amber-500/20 rounded-[2rem] flex items-center justify-center text-amber-500">
                                <GraduationCap size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white">Education History</h3>
                                <p className="text-slate-400 font-medium">Academic foundation and verified certifications.</p>
                            </div>
                        </div>
                        <div className="flex-1 max-w-xl">
                            {profile.education?.length > 0 ? profile.education.map((edu: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5 mb-4 last:mb-0">
                                    <div>
                                        <h4 className="font-bold text-white">{edu.school}</h4>
                                        <p className="text-sm text-slate-400">{edu.degree} • {edu.field}</p>
                                    </div>
                                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</p>
                                </div>
                            )) : (
                                <p className="text-slate-600 font-bold uppercase italic text-center">Academic records pending verification.</p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-center">
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
                    Generated via <span className="text-blue-500">Allumnova Professional</span> Platform
                </p>
                <div className="mt-4 flex justify-center gap-6">
                    <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Platform</Link>
                    <Link to="/discover" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Network</Link>
                    <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Join Hub</Link>
                </div>
            </footer>
        </div>
    );
};

export default PublicPortfolioPage;
