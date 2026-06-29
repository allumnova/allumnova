import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, CheckCircle2, DollarSign, Clock, ListTodo, Bot, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        projects: 0,
        tasks: 0,
        unpaidInvoices: 0,
        totalCost: 0,
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // 1. Fetch projects/tasks
                const projRes = await api.get('/projects');
                let taskCount = 0;
                if (projRes.data?.success) {
                    taskCount = projRes.data.data.reduce((acc: number, curr: any) => acc + (curr.tasks?.length || 0), 0);
                }

                // 2. Fetch invoices
                const invoiceRes = await api.get('/billing/invoices');
                let unpaidSum = 0;
                if (invoiceRes.data?.success) {
                    unpaidSum = invoiceRes.data.data
                        .filter((inv: any) => inv.status === 'UNPAID')
                        .reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
                }

                // 3. Fetch token metrics
                const metricsRes = await api.get('/ai/metrics');
                let costSum = 0;
                if (metricsRes.data?.success) {
                    costSum = metricsRes.data.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.estimatedCostUsd), 0);
                }

                // 4. Fetch audit logs if admin
                if (user?.role === 'ADMIN') {
                    const logsRes = await api.get('/billing/audit-logs');
                    if (logsRes.data?.success) {
                        setRecentLogs(logsRes.data.data.slice(0, 5));
                    }
                }

                setStats({
                    projects: projRes.data?.data?.length || 0,
                    tasks: taskCount,
                    unpaidInvoices: unpaidSum,
                    totalCost: costSum,
                });
            } catch (error) {
                console.error('Failed to load dashboard statistics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.role]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                    Welcome back, {user?.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Here is a visual summary of your {user?.organization?.name} workspace operations.
                </p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projects</span>
                        <div className="p-1.5 bg-blue-500/20 text-blue-500 rounded-lg"><LayoutDashboard size={16} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stats.projects}</h3>
                    <p className="text-[9px] font-semibold text-slate-550 dark:text-slate-450 uppercase">Active Workspaces</p>
                </div>

                <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks List</span>
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg"><ListTodo size={16} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stats.tasks}</h3>
                    <p className="text-[9px] font-semibold text-slate-550 dark:text-slate-450 uppercase">SLA & Kanban Tasks</p>
                </div>

                <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</span>
                        <div className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg"><DollarSign size={16} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">${stats.unpaidInvoices.toLocaleString()}</h3>
                    <p className="text-[9px] font-semibold text-slate-550 dark:text-slate-450 uppercase">Unpaid Accounts</p>
                </div>

                <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Telemetry</span>
                        <div className="p-1.5 bg-purple-500/20 text-purple-500 rounded-lg"><Bot size={16} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">${stats.totalCost.toFixed(4)}</h3>
                    <p className="text-[9px] font-semibold text-slate-550 dark:text-slate-450 uppercase">Cumulative LLM Cost</p>
                </div>
            </div>

            {/* Quick Actions & Recent Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 💡 AI Native Scoping Callout */}
                <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-blue-500/20">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                        Autopilot Scoping Engine
                    </h3>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mb-6">
                        Paste requirements or talk directly to our Business Architect Agent to instantly generate complete project boards, estimate billing targets, and draft official proposals under 15 minutes.
                    </p>
                    <div className="flex gap-3">
                        <Link 
                            to="/requirements" 
                            className="btn-primary py-2.5 text-xs font-bold uppercase tracking-wider px-5"
                        >
                            Extract Tasks
                            <ArrowUpRight size={14} />
                        </Link>
                        <Link 
                            to="/consultant" 
                            className="btn-secondary py-2.5 text-xs font-bold uppercase tracking-wider px-5"
                        >
                            Talk to PM Agent
                        </Link>
                    </div>
                </div>

                {/* 📜 Audit log entries */}
                <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-indigo-500" /> Recent Audit Entries
                        </h4>
                        
                        {user?.role !== 'ADMIN' ? (
                            <p className="text-xs text-slate-400 py-6 text-center">
                                Audit logging telemetry is restricted to Workspace Administrators.
                            </p>
                        ) : recentLogs.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">
                                No recent mutations tracked in organization logs.
                            </p>
                        ) : (
                            <div className="space-y-3.5">
                                {recentLogs.map((log: any) => (
                                    <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-900 pb-2">
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[220px]">
                                                {log.action}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-medium uppercase">
                                                On Table: {log.tableName} &bull; ID: {log.recordId.substring(0,8)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {user?.role === 'ADMIN' && recentLogs.length > 0 && (
                        <Link 
                            to="/admin" 
                            className="text-blue-500 hover:text-blue-600 text-[10px] font-bold uppercase tracking-wider mt-4 self-start"
                        >
                            View Full Logs &rarr;
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
