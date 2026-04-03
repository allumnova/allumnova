import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import { Clock, ShieldAlert, LogOut, LayoutGrid, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingApprovalPage: React.FC = () => {
    const { logout, user, refreshUser } = useAuth();
    const { activeCollege, allColleges, setActiveCollege } = useCollege();
    const navigate = useNavigate();

    const handleRefresh = async () => {
        const updatedUser = await refreshUser();
        if (updatedUser?.is_verified) {
            navigate('/');
        } else {
            window.location.reload();
        }
    };

    const handleSwitchCollege = (college: any) => {
        setActiveCollege(college);
        navigate('/');
    };

    const otherVerifiedColleges = (allColleges || []).filter(c => c && c.id !== activeCollege?.id);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent transition-colors duration-500">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 shadow-2xl shadow-blue-500/10 relative overflow-hidden text-center">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/30 -rotate-3 hover:rotate-0 transition-all duration-500">
                            <Clock className="text-white" size={44} />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Verification Pending</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 px-4">
                            Welcome to <span className="font-extrabold text-blue-500">{activeCollege?.name || 'Allumnova'}</span>. <br />
                            Our team is currently reviewing your membership. Access will be granted shortly.
                        </p>

                        <div className="space-y-4 mb-10 text-left">
                            <div className="p-5 rounded-3xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-4 group transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                    <ShieldAlert size={20} className="text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Verification Required</h4>
                                    <p className="text-[10px] text-slate-500 leading-normal">Feed, Discover, and Hub features are restricted until your request is approved.</p>
                                </div>
                            </div>
                        </div>

                        {otherVerifiedColleges.length > 0 && (
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4 px-2">
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Switch to Verified</p>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                                </div>
                                <div className="space-y-2">
                                    {otherVerifiedColleges.map(college => (
                                        <button
                                            key={college.id}
                                            onClick={() => handleSwitchCollege(college)}
                                            className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                                    <LayoutGrid size={18} className="text-blue-500 group-hover:text-white transition-colors" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{college.name}</span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleRefresh}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
                            >
                                Refresh Status
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/onboarding')}
                                    className="py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold transition-all"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={logout}
                                    className="py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Need help? Contact <a href="mailto:support@allumnova.com" className="text-blue-500 hover:underline font-bold">support@allumnova.com</a>
                    </p>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                        <CheckCircle2 size={10} /> Secure Campus Network
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApprovalPage;
