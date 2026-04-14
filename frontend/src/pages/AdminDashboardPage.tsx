import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, AlertCircle, TrendingUp, CheckCircle, Clock, UserCheck, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const res = await api.get('/admin/dashboard');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="text-center py-10 text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-bold">Failed to load dashboard data</h3>
                <p className="text-sm opacity-80 mt-1">Check backend connection</p>
            </div>
        );
    }

    const { stats: apiStats, recentActivity: liveActivity } = dashboardData;

    const stats = [
        { title: 'Total Users', value: apiStats.totalUsers.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Registered Colleges', value: apiStats.registeredColleges.toString(), icon: Building, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'User Verifications', value: apiStats.pendingVerifications.toString(), icon: UserCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Hub Requests', value: apiStats.pendingColleges.toString(), icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'Hub Proposals', value: apiStats.pendingEnvironments.toString(), icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Reported Content', value: apiStats.reportedContent.toString(), icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}</h2>
                    <p className="text-slate-500">Here's what's happening on Allumnova today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/requests')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm"
                    >
                        <CheckCircle size={16} /> Review Pending Approvals
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                <TrendingUp size={12} /> +12%
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Platform Activity</h3>
                    <div className="space-y-6">
                        {liveActivity && liveActivity.length > 0 ? liveActivity.map((activity: any, idx: number) => (
                            <div key={activity.id} className="flex gap-4 relative">
                                {idx !== liveActivity.length - 1 && (
                                    <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-200 dark:bg-white/10" />
                                )}
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-slate-900 flex shrink-0 items-center justify-center text-slate-400 z-10">
                                    {activity.type === 'user_joined' && <Users size={16} />}
                                    {activity.type === 'verification' && <UserCheck size={16} />}
                                    {activity.type === 'college_request' && <Building size={16} />}
                                    {activity.type === 'post_flag' && <AlertCircle size={16} />}
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {activity.user}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-0.5">{activity.detail}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm">No recent activity found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">System Health</h3>
                        <p className="text-blue-100 text-sm mb-6">
                            All services are running normally. Database load is at 14% and Redis hit rate is 98%.
                        </p>

                        <div className="space-y-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm">API Traffic</span>
                                <span className="text-sm font-bold">Normal</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm">Database</span>
                                <span className="text-sm font-bold text-emerald-300">Healthy</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                        View Detailed Metrics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
