import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, Target, Award, Shield, Briefcase, GraduationCap, 
    Plus, Sparkles, ChevronRight, CheckCircle2, Globe, Github, 
    Twitter, Link as LinkIcon, Camera, Save, ArrowRight, Info,
    Trash2, Edit3, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CareerBuilderPage = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [step, setStep] = useState(0); // 0: Fast Hook, 1: Dashboard
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const navigate = useNavigate();

    // Form States
    const [hookForm, setHookForm] = useState({
        targetRole: '',
        careerStage: 'STUDENT'
    });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/profile/me');
            const data = res.data.data;
            setProfile(data);
            // If targetRole is already set, skip the hook
            if (data.targetRole) {
                setStep(1);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleHookSubmit = async () => {
        try {
            await api.patch('/profile/me', hookForm);
            await refreshUser();
            setStep(1);
            fetchProfile();
        } catch (err) {
            console.error('Hook submission failed:', err);
        }
    };

    const calculatePercentage = () => {
        return profile?.completionRatio || 0;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-6 px-4 md:px-0 max-w-5xl mx-auto transition-colors">
            <AnimatePresence mode="wait">
                {step === 0 ? (
                    <motion.div 
                        key="hook"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
                            <Rocket className="text-white" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Let's build your <span className="text-blue-500">Dream Career.</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">We'll help you become world-class. Tell us where you are.</p>
                        </div>

                        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1 text-left">Your Goal</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SDE, Designer, Founder"
                                    value={hookForm.targetRole}
                                    onChange={(e) => setHookForm({...hookForm, targetRole: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {['STUDENT', 'GRADUATE', 'WORKING'].map((stage) => (
                                    <button
                                        key={stage}
                                        onClick={() => setHookForm({...hookForm, careerStage: stage})}
                                        className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                            hookForm.careerStage === stage 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                            : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleHookSubmit}
                                disabled={!hookForm.targetRole}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Start Building <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Header & Progress */}
                        <header className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-blue-500/5">
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                                        Roadmap to <span className="text-blue-500">{profile?.targetRole}</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Keep your portfolio alive. Small daily updates win.</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {profile?.careerStage}
                                    </div>
                                    <button onClick={() => navigate(`/u/${profile.username}`)} className="px-4 py-1.5 bg-slate-500/5 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50 dark:border-white/5 flex items-center gap-2 hover:bg-slate-500/10 transition-all">
                                        <Globe size={12} /> View Portfolio
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <svg className="w-32 h-32 md:w-40 md:h-40">
                                    <circle className="text-slate-100 dark:text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="50%" cy="50%" />
                                    <motion.circle 
                                        initial={{ strokeDashoffset: 314 }}
                                        animate={{ strokeDashoffset: 314 - (314 * calculatePercentage()) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="text-blue-500" 
                                        strokeWidth="10" 
                                        strokeDasharray="314"
                                        strokeLinecap="round" 
                                        stroke="currentColor" 
                                        fill="transparent" 
                                        r="50" cx="50%" cy="50%" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">{calculatePercentage()}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Strength</span>
                                </div>
                            </div>
                        </header>

                        {/* Modular Blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Experience Section */}
                            <SectionCard 
                                icon={Briefcase} 
                                title="Experience" 
                                count={profile?.experience?.length || 0}
                                color="blue"
                                onClick={() => setActiveSection('experience')}
                            />
                            {/* Education Section */}
                            <SectionCard 
                                icon={GraduationCap} 
                                title="Education" 
                                count={profile?.education?.length || 0}
                                color="emerald"
                                onClick={() => setActiveSection('education')}
                            />
                            {/* Projects Section */}
                            <SectionCard 
                                icon={Target} 
                                title="Projects" 
                                count={profile?.projects?.length || 0}
                                color="purple"
                                onClick={() => navigate('/launchpad')}
                            />
                            {/* Certifications Section */}
                            <SectionCard 
                                icon={Award} 
                                title="Certifications" 
                                count={profile?.certifications?.length || 0}
                                color="amber"
                                onClick={() => setActiveSection('certifications')}
                            />
                            {/* Social Presence Section */}
                            <SectionCard 
                                icon={LinkIcon} 
                                title="Social Links" 
                                count={(profile?.githubUrl ? 1 : 0) + (profile?.linkedIn ? 1 : 0) + (profile?.websiteUrl ? 1 : 0)}
                                color="rose"
                                onClick={() => setActiveSection('socials')}
                            />
                            {/* Achievements Section */}
                            <SectionCard 
                                icon={Heart} 
                                title="Achievements" 
                                count={profile?.achievements?.length || 0}
                                color="indigo"
                                onClick={() => setActiveSection('achievements')}
                            />
                        </div>

                        {/* Smart Suggestions */}
                        <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                             <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Sparkles className="text-blue-500" />
                             </div>
                             <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-black text-white dark:text-slate-900 tracking-tight">Level Up Your Profile</h3>
                                <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Students with 80%+ strength get 5x more connection requests from industry alumni.</p>
                             </div>
                             <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                                {calculatePercentage() < 50 ? 'Add 2 Projects' : 'Get Verified'}
                             </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Section Manager Modal */}
            <AnimatePresence>
                {activeSection && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSection(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/5 max-h-[90vh] flex flex-col"
                        >
                            <SectionManager 
                                type={activeSection} 
                                profile={profile}
                                onUpdate={fetchProfile}
                                onClose={() => setActiveSection(null)} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SectionManager = ({ type, profile, onClose, onUpdate }: any) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const handleSave = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'socials') {
                await api.patch('/profile/me', formData);
            } else {
                await api.post(`/profile/${type.slice(0, -1)}`, formData);
            }
            onUpdate();
            onClose();
        } catch (err) {
            console.error(`Failed to save ${type}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this?')) return;
        try {
            await api.delete(`/profile/${type.slice(0, -1)}/${id}`);
            onUpdate();
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
        }
    };

    const renderForm = () => {
        switch (type) {
            case 'experience':
                return (
                    <div className="space-y-4">
                        <Input label="Company" value={formData.company} onChange={(v: any) => setFormData({...formData, company: v})} />
                        <Input label="Role" value={formData.position} onChange={(v: any) => setFormData({...formData, position: v})} />
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Start Date" type="date" value={formData.startDate} onChange={(v: any) => setFormData({...formData, startDate: v})} />
                             <Input label="End Date" type="date" placeholder="Current" value={formData.endDate} onChange={(v: any) => setFormData({...formData, endDate: v})} />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact / Achievement</label>
                                <button type="button" className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-all">
                                    <Sparkles size={10} /> AI Improve
                                </button>
                            </div>
                            <textarea 
                                rows={3} 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white resize-none"
                                placeholder="What did you build? What was the result?"
                            />
                        </div>
                    </div>
                );
            case 'education':
                return (
                    <div className="space-y-4">
                        <Input label="Institution" value={formData.school} onChange={(v: any) => setFormData({...formData, school: v})} />
                        <Input label="Degree" value={formData.degree} onChange={(v: any) => setFormData({...formData, degree: v})} />
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Start Date" type="date" value={formData.startDate} onChange={(v: any) => setFormData({...formData, startDate: v})} />
                             <Input label="GPA / Percentage" value={formData.description} onChange={(v: any) => setFormData({...formData, description: v})} />
                        </div>
                    </div>
                );
            case 'certifications':
                return (
                    <div className="space-y-4">
                        <Input label="Certificate Title" value={formData.title} onChange={(v: any) => setFormData({...formData, title: v})} />
                        <Input label="Issuing Organization" value={formData.organization} onChange={(v: any) => setFormData({...formData, organization: v})} />
                        <Input label="Credential Link" value={formData.credentialUrl} onChange={(v: any) => setFormData({...formData, credentialUrl: v})} />
                    </div>
                );
            case 'socials':
                return (
                    <div className="space-y-4">
                        <Input icon={Github} label="GitHub URL" value={formData.githubUrl || profile.githubUrl} onChange={(v: any) => setFormData({...formData, githubUrl: v})} />
                        <Input icon={Twitter} label="Twitter / X" value={formData.twitterUrl || profile.twitterUrl} onChange={(v: any) => setFormData({...formData, twitterUrl: v})} />
                        <Input icon={Globe} label="Personal Website" value={formData.websiteUrl || profile.websiteUrl} onChange={(v: any) => setFormData({...formData, websiteUrl: v})} />
                    </div>
                );
            default: return null;
        }
    };

    const items = profile?.[type] || [];

    return (
        <div className="p-8 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight capitalize">{type} Manager</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage your professional blocks</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-8 flex-1 overflow-y-auto px-1 profile-scrollbar pb-10">
                {items.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Current Items</label>
                        {items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/50 dark:border-white/5">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.company || item.school || item.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.position || item.degree || item.organization}</p>
                                </div>
                                <button type="button" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Add New Item</label>
                    {renderForm()}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Input = ({ label, icon: Icon, value, onChange, type = "text", placeholder }: any) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
            <input 
                type={type} 
                value={value || ''} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 ${Icon ? 'pl-14' : 'px-6'} pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all`} 
            />
        </div>
    </div>
);

const SectionCard = ({ icon: Icon, title, count, color, onClick }: any) => {
    const colorMap: any = {
        blue: 'text-blue-500 bg-blue-500/5 border-blue-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
        purple: 'text-purple-500 bg-purple-500/5 border-purple-500/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-500 bg-rose-500/5 border-rose-500/20',
        indigo: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/20'
    };

    return (
        <motion.button 
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 text-left flex flex-col gap-6 group transition-all"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${colorMap[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {title}
                    {count > 0 && <CheckCircle2 size={16} className="text-emerald-500" />}
                </h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{count} Items Added</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
            </div>
            
            <div className="w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: count > 0 ? '100%' : '0%' }}
                    className={`h-full ${colorMap[color].split(' ')[0].replace('text-', 'bg-')}`} 
                />
            </div>
        </motion.button>
    );
};

export default CareerBuilderPage;
