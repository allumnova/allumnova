import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, Server, Database } from 'lucide-react';
import api from '../api/axios';

interface TelemetryTask {
    id: string;
    title: string;
    slaDeadline: string;
    status: string;
}

const RightSidebar = () => {
    const [cpuLoad, setCpuLoad] = useState(24);
    const [memLoad, setMemLoad] = useState(48);
    const [urgentTasks, setUrgentTasks] = useState<TelemetryTask[]>([]);
    const [queueJobs, setQueueJobs] = useState({ active: 0, completed: 18, failed: 1 });

    // 1. Simulate DB Load metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuLoad(prev => {
                const change = Math.floor(Math.random() * 9) - 4; // -4 to +4
                const target = prev + change;
                return Math.max(5, Math.min(95, target));
            });
            setMemLoad(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                const target = prev + change;
                return Math.max(30, Math.min(85, target));
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Tasks with short SLA limits
    useEffect(() => {
        const fetchSlas = async () => {
            try {
                const res = await api.get('/projects');
                if (res.data?.success) {
                    const allTasks: TelemetryTask[] = [];
                    res.data.data.forEach((p: any) => {
                        if (p.tasks) {
                            p.tasks.forEach((t: any) => {
                                if (t.slaDeadline && t.status !== 'DONE') {
                                    allTasks.push({
                                        id: t.id,
                                        title: t.title,
                                        slaDeadline: t.slaDeadline,
                                        status: t.status
                                    });
                                }
                            });
                        }
                    });
                    
                    // Sort tasks by nearest SLA deadline
                    allTasks.sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
                    setUrgentTasks(allTasks.slice(0, 3));
                    setQueueJobs({
                        active: allTasks.length > 0 ? 1 : 0,
                        completed: 24,
                        failed: 1
                    });
                }
            } catch (error) {
                console.warn('Failed to load telemetry tasks', error);
            }
        };

        fetchSlas();
        const interval = setInterval(fetchSlas, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            {/* 📊 Live System Telemetry */}
            <div className="glass-card p-6 bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <Activity size={16} className="text-blue-500 animate-pulse" />
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Telemetry</h4>
                </div>

                <div className="space-y-4">
                    {/* Database Telemetry */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Database size={12} /> Database CPU Load</span>
                            <span className={cpuLoad > 80 ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-white'}>{cpuLoad}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${cpuLoad > 80 ? 'bg-rose-500' : cpuLoad > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${cpuLoad}%` }}
                            />
                        </div>
                    </div>

                    {/* Server Memory */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Server size={12} /> Node Server RAM</span>
                            <span className="text-slate-900 dark:text-white">{memLoad}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${memLoad}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ⚠️ SLA Escapes Warnings */}
            <div className="glass-card p-6 bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldAlert size={16} className="text-rose-500" />
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active SLA Alerts</h4>
                </div>

                <div className="space-y-4">
                    {urgentTasks.length === 0 ? (
                        <div className="flex items-center gap-2 py-2 text-slate-400 text-xs">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span>All tasks safe. Zero active SLA breaches.</span>
                        </div>
                    ) : (
                        urgentTasks.map((task) => {
                            const remainingMs = new Date(task.slaDeadline).getTime() - new Date().getTime();
                            const remainingMins = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
                            const isCrit = remainingMins <= 120; // 2 hours or less

                            return (
                                <div key={task.id} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-850 rounded-xl">
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight mb-1.5">
                                        {task.title}
                                    </h5>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {task.status}
                                        </span>
                                        <span className={`text-[10px] font-bold ${isCrit ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
                                            {remainingMins > 60 
                                                ? `Breaches in ${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m` 
                                                : `Breaches in ${remainingMins}m`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ⚙️ BullMQ Queue Status */}
            <div className="glass-card p-6 bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <Activity size={16} className="text-amber-500" />
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">BullMQ Scheduler</h4>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Active</p>
                        <p className="text-sm font-bold text-blue-500">{queueJobs.active}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Done</p>
                        <p className="text-sm font-bold text-emerald-500">{queueJobs.completed}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Failed</p>
                        <p className="text-sm font-bold text-rose-500">{queueJobs.failed}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
