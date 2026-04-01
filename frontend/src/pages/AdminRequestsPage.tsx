import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, Building2, Globe, MapPin, ExternalLink, User, Phone, Linkedin, FileText } from 'lucide-react';

const AdminRequestsPage = () => {
    const [tab, setTab] = useState<'colleges' | 'users'>('colleges');
    const [collegeRequests, setCollegeRequests] = useState<any[]>([]);
    const [userRequests, setUserRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'colleges') {
                const res = await api.get('/colleges/all-requests');
                setCollegeRequests(res.data.data);
            } else {
                const res = await api.get('/profile/admin/pending-verifications');
                setUserRequests(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const [editingCollege, setEditingCollege] = useState<Record<string, { name: string, subdomain: string }>>({});

    const handleCollegeEdit = (requestId: string, field: 'name' | 'subdomain', value: string) => {
        setEditingCollege(prev => ({
            ...prev,
            [requestId]: {
                ...(prev[requestId] || {
                    name: collegeRequests.find(r => r.id === requestId)?.name || '',
                    subdomain: collegeRequests.find(r => r.id === requestId)?.subdomain || ''
                }),
                [field]: value
            }
        }));
    };

    const handleCollegeReview = async (requestId: string, status: 'approved' | 'rejected') => {
        try {
            const updates = status === 'approved' ? editingCollege[requestId] : undefined;
            await api.post('/colleges/review-request', { requestId, status, updates });
            alert(`College request ${status} successfully!`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to review college request.');
        }
    };

    const handleUserReview = async (mappingId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await api.post('/profile/admin/verify-user', { mappingId, status });
            alert(`User has been ${status} successfully!`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to verify user.');
        }
    };

    const renderCollegeRequests = () => (
        <AnimatePresence mode="wait">
            {collegeRequests.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                    <p className="text-slate-500 font-medium">No pending college requests.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(collegeRequests) && collegeRequests.map((req) => {
                        const editData = editingCollege[req.id] || { name: req.name, subdomain: req.subdomain || '' };

                        return (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex gap-5 flex-1 items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-500 overflow-hidden shrink-0 shadow-inner">
                                        {req.logo ? <img src={req.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={32} />}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            {req.status === 'PENDING' ? (
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => handleCollegeEdit(req.id, 'name', e.target.value)}
                                                    className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                                    placeholder="College Name"
                                                />
                                            ) : (
                                                <h3 className="font-bold text-slate-900 dark:text-white">{req.name}</h3>
                                            )}
                                            <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 items-center">
                                            <span className="flex items-center gap-1">
                                                <Globe size={12} />
                                                {req.status === 'PENDING' ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={editData.subdomain}
                                                            onChange={(e) => handleCollegeEdit(req.id, 'subdomain', e.target.value)}
                                                            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 w-24"
                                                            placeholder="subdomain"
                                                        />
                                                        <span>.allumnova.com</span>
                                                    </div>
                                                ) : (
                                                    <span>{req.subdomain}.allumnova.com</span>
                                                )}
                                            </span>
                                            {req.location && <span className="flex items-center gap-1"><MapPin size={12} /> {req.location}</span>}
                                            {req.website && <a href={req.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">Website <ExternalLink size={10} /></a>}
                                        </div>
                                    </div>
                                </div>
                                {req.status === 'PENDING' && (
                                    <div className="flex gap-2 self-end md:self-center">
                                        <button onClick={() => handleCollegeReview(req.id, 'rejected')} className="p-3 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 text-red-600 rounded-xl transition-all"><X size={20} /></button>
                                        <button onClick={() => handleCollegeReview(req.id, 'approved')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">Approve</button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </AnimatePresence>
    );

    const renderUserRequests = () => (
        <AnimatePresence mode="wait">
            {userRequests.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                    <p className="text-slate-500 font-medium">No pending user verifications.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(userRequests) && userRequests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6"
                        >
                            <div className="flex gap-5 flex-1 items-start">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-500 overflow-hidden shrink-0 shadow-inner">
                                    {req.user?.avatar ? <img src={req.user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} />}
                                </div>
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{req.user?.name}</h3>
                                        <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                                            {req.role}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5"><Phone size={12} /> {req.user?.phone || 'No Phone'}</span>
                                        {req.user?.linkedIn && <a href={req.user.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline"><Linkedin size={12} /> LinkedIn</a>}
                                    </div>
                                    {req.documentUrl && (
                                        <div className="mt-3 inline-flex items-center gap-2 p-2 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                                            <FileText size={14} className="text-blue-500" />
                                            <a
                                                href={req.documentUrl.startsWith('http') ? req.documentUrl : req.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
                                            >
                                                Verification Document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-start pt-2">
                                <button onClick={() => handleUserReview(req.id, 'REJECTED')} className="p-3 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 text-red-600 rounded-xl transition-all"><X size={20} /></button>
                                <button onClick={() => handleUserReview(req.id, 'VERIFIED')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">Verify</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Requests</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage pending users and college applications.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                    <button onClick={() => setTab('colleges')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'colleges' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Colleges</button>
                    <button onClick={() => setTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'users' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Users</button>
                </div>
            </div>

            <div className="relative mt-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-slate-900/30 h-32 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-white/5 shadow-sm" />)}
                    </div>
                ) : (
                    tab === 'colleges' ? renderCollegeRequests() : renderUserRequests()
                )}
            </div>
        </div>
    );
};

export default AdminRequestsPage;
