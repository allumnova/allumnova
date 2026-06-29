import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Bot, DollarSign, Activity, FileText, CheckCircle } from 'lucide-react';
import api from '../api/axios';

interface Prompt {
    id: string;
    name: string;
    template: string;
    version: number;
}

interface AuditLog {
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
}

interface Metric {
    id: string;
    agentId: string;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: string;
    createdAt: string;
}

const AdminPanel = () => {
    const [prompts, setPrompts] = useState<Prompt[]>([
        { id: '1', name: 'REQUIREMENTS_EXTRACTOR', template: 'Extract JSON milestones...', version: 1 },
        { id: '2', name: 'PM_AGENT', template: 'Analyze logs...', version: 1 }
    ]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [activeTab, setActiveTab] = useState<'METRICS' | 'PROMPTS' | 'AUDIT'>('METRICS');
    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            // 1. Fetch audit logs
            const logsRes = await api.get('/billing/audit-logs');
            if (logsRes.data?.success) {
                setAuditLogs(logsRes.data.data);
            }

            // 2. Fetch AI metrics
            const metricsRes = await api.get('/ai/metrics');
            if (metricsRes.data?.success) {
                setMetrics(metricsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to load admin panel details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const calculateCostSummary = () => {
        return metrics.reduce((acc, curr) => acc + parseFloat(curr.estimatedCostUsd), 0);
    };

    const calculateTokenSummary = () => {
        const prompt = metrics.reduce((acc, curr) => acc + curr.promptTokens, 0);
        const completion = metrics.reduce((acc, curr) => acc + curr.completionTokens, 0);
        return { prompt, completion, total: prompt + completion };
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Sliders className="text-purple-500" /> System Control & Developer Panel
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monitor LLM telemetry, update instruction prompts templates, and review database audit ledgers.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider gap-6">
                <button
                    onClick={() => setActiveTab('METRICS')}
                    className={`pb-3 transition-colors ${
                        activeTab === 'METRICS' 
                            ? 'border-b-2 border-blue-500 text-blue-500' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                    }`}
                >
                    LLM Cost & Telemetry
                </button>
                <button
                    onClick={() => setActiveTab('PROMPTS')}
                    className={`pb-3 transition-colors ${
                        activeTab === 'PROMPTS' 
                            ? 'border-b-2 border-blue-500 text-blue-500' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                    }`}
                >
                    Prompts Templates
                </button>
                <button
                    onClick={() => setActiveTab('AUDIT')}
                    className={`pb-3 transition-colors ${
                        activeTab === 'AUDIT' 
                            ? 'border-b-2 border-blue-500 text-blue-500' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                    }`}
                >
                    Cryptographic Audits
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'METRICS' && (
                <div className="space-y-6">
                    {/* Cost cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">AI Budget Spent</span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                                <DollarSign size={20} className="text-emerald-500" />
                                {calculateCostSummary().toFixed(4)}
                            </h3>
                            <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-2">Cumulative Costs</p>
                        </div>
                        <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Prompt Tokens</span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                {calculateTokenSummary().prompt.toLocaleString()}
                            </h3>
                            <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-2">Inbound Request Tokens</p>
                        </div>
                        <div className="glass-card p-6 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Completion Tokens</span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                {calculateTokenSummary().completion.toLocaleString()}
                            </h3>
                            <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-2">Outbound Completion Tokens</p>
                        </div>
                    </div>

                    {/* Metrics log list */}
                    <div className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" /> AI LLM Requests History
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                                <thead>
                                    <tr className="border-b border-slate-205 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                                        <th className="py-2.5">Agent</th>
                                        <th className="py-2.5">Prompt Tkns</th>
                                        <th className="py-2.5">Compl. Tkns</th>
                                        <th className="py-2.5">Estimated Cost</th>
                                        <th className="py-2.5">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((m) => (
                                        <tr key={m.id} className="border-b border-slate-100 dark:border-slate-900">
                                            <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{m.agentId}</td>
                                            <td className="py-3 font-mono">{m.promptTokens}</td>
                                            <td className="py-3 font-mono">{m.completionTokens}</td>
                                            <td className="py-3 font-mono text-emerald-500 font-bold">${parseFloat(m.estimatedCostUsd).toFixed(5)}</td>
                                            <td className="py-3 text-slate-450">{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PROMPTS' && (
                <div className="space-y-4">
                    {prompts.map((p) => (
                        <div key={p.id} className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                        {p.name}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                                        System Instruction Version: {p.version}.0
                                    </span>
                                </div>
                                <button className="btn-secondary py-1 px-3 text-[9px] font-bold uppercase tracking-wider">
                                    Update Template
                                </button>
                            </div>
                            <textarea
                                defaultValue={p.template}
                                disabled
                                className="input-field min-h-[80px] font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-3 leading-relaxed"
                            />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'AUDIT' && (
                <div className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Shield size={14} className="text-purple-500" /> Relational Mutations Log Ledger
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                            <thead>
                                <tr className="border-b border-slate-205 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                                    <th className="py-2.5">User</th>
                                    <th className="py-2.5">Action</th>
                                    <th className="py-2.5">Table Target</th>
                                    <th className="py-2.5">Record ID</th>
                                    <th className="py-2.5">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-900">
                                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                                            {log.user?.name || 'Automated Engine'}
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-mono font-bold text-[10px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 font-semibold">{log.tableName}</td>
                                        <td className="py-3 font-mono text-slate-500">{log.recordId.substring(0, 12)}...</td>
                                        <td className="py-3 text-slate-450">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
