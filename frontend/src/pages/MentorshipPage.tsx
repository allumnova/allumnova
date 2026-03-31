import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface MentorshipRequest {
    id: string;
    studentId: string;
    alumniId: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    student?: {
        id: string;
        name: string;
        avatar?: string;
        department?: string;
    };
    alumni?: {
        id: string;
        name: string;
        avatar?: string;
        department?: string;
    };
}

const MentorshipPage = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/mentorship/requests');
            setRequests(res.data);
        } catch (error) {
            console.error('Fetch mentorship requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
        try {
            await api.patch('/mentorship/status', { requestId, status });
            fetchRequests();
        } catch (error) {
            console.error('Status update error:', error);
        }
    };

    const isAlumni = user?.role === 'alumni';

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {isAlumni ? 'Mentorship Dashboard' : 'Your Mentors'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {isAlumni 
                        ? 'Manage incoming requests from students seeking your guidance.' 
                        : 'Track your requests to connect with alumni for professional growth.'}
                </p>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white dark:bg-white/5 rounded-[2rem] animate-pulse border border-slate-200 dark:border-white/10" />
                    ))}
                </div>
            ) : requests.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={req.id}
                            className="group relative bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10">
                                        <img 
                                            src={(isAlumni ? req.student?.avatar : req.alumni?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAlumni ? req.student?.name : req.alumni?.name}`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {isAlumni ? req.student?.name : req.alumni?.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                            {isAlumni ? req.student?.department : req.alumni?.department}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 max-w-md">
                                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic line-clamp-2">
                                            "{req.message}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {req.status === 'pending' ? (
                                        isAlumni ? (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(req.id, 'accepted')}
                                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(req.id, 'declined')}
                                                    className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:text-rose-500 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                                                <Clock size={14} />
                                                Pending Approval
                                            </div>
                                        )
                                    ) : (
                                        <div className={clsx(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            req.status === 'accepted' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}>
                                            {req.status === 'accepted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {req.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-[3.5rem] border border-dashed border-slate-300 dark:border-white/10">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
                        <Award size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No mentorship tracks yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                        {isAlumni 
                            ? "Student requests will appear here once they find your profile in the directory." 
                            : "Connect with alumni through their profiles to request professional guidance."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MentorshipPage;
