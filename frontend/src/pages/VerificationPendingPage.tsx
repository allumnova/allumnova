import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollege } from '../contexts/CollegeContext';
import { Clock, ShieldAlert, LogOut, LayoutGrid, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationPendingPage: React.FC = () => {
    const { logout, user } = useAuth();
    const { activeCollege, allColleges, setActiveCollege } = useCollege();
    const navigate = useNavigate();

    const handleSwitchCollege = (college: any) => {
        setActiveCollege(college);
        navigate('/feed');
    };

    const otherVerifiedColleges = (allColleges || []).filter(c => c && c.id !== activeCollege?.id);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden text-center">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20 rotate-3 transform hover:rotate-0 transition-transform">
                            <Clock className="text-white" size={40} />
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Verification Pending</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                            Welcome to <span className="font-bold text-blue-500">{activeCollege?.name}</span>! <br />
                            The administration is currently reviewing your membership request. This usually takes 24-48 hours.
                        </p>

                        <div className="space-y-3 mb-8">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-left flex items-start gap-3">
                                <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Restricted Access</h4>
                                    <p className="text-[10px] text-slate-500">Feed and Hub activities are locked until approval.</p>
                                </div>
                            </div>
                        </div>

                        {otherVerifiedColleges.length > 0 && (
                            <div className="mb-8">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Switch to Verified Campus</p>
                                {otherVerifiedColleges.map(college => (
                                    <button
                                        key={college.id}
                                        onClick={() => handleSwitchCollege(college)}
                                        className="w-full group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all mb-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <LayoutGrid size={16} className="text-blue-500" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{college.name}</span>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold transition-all"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={logout}
                                className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-medium">
                    Need help? Contact <a href="mailto:support@allumnova.com" className="text-blue-500 hover:underline">support@allumnova.com</a>
                </p>
            </motion.div>
        </div>
    );
};

export default VerificationPendingPage;
