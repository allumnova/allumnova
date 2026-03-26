import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, LogOut } from 'lucide-react';

const PendingApprovalPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-blue-500/5 max-w-md w-full text-center"
            >
                <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Under Review</h2>

                <p className="text-slate-500 mb-8">
                    Your details have been submitted successfully and are currently pending approval.
                    You will receive full access to the platform once an admin verifies your identity.
                </p>

                <div className="space-y-4 flex flex-col items-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        Check Status Again
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors py-2 font-medium"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApprovalPage;
