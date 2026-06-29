import React, { useState } from 'react';
import { FileText, Sparkles, Send, CheckCircle2, ChevronRight, FolderPlus } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskSpec {
    title: string;
    description: string;
    priority: string;
}

interface MilestoneSpec {
    title: string;
    tasks: TaskSpec[];
}

interface ExtractionResult {
    projectName: string;
    description: string;
    milestones: MilestoneSpec[];
}

const RequirementEnginePage = () => {
    const [requirements, setRequirements] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExtractionResult | null>(null);
    const [saved, setSaved] = useState(false);

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requirements.trim()) return;

        try {
            setLoading(true);
            setSaved(false);
            setResult(null);
            
            const res = await api.post('/ai/requirements/extract', { requirements });
            if (res.data?.success) {
                setResult(res.data.data);
            }
        } catch (error) {
            console.error('Failed to extract requirements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToWorkspace = async () => {
        if (!result) return;

        try {
            setLoading(true);
            // 1. Create the project
            const projRes = await api.post('/projects', {
                name: result.projectName,
                description: result.description,
                status: 'IDEA'
            });

            if (projRes.data?.success) {
                const projectId = projRes.data.data.id;

                // 2. Create tasks under this project
                for (const milestone of result.milestones) {
                    for (const task of milestone.tasks) {
                        await api.post(`/projects/${projectId}/tasks`, {
                            title: `[${milestone.title.split(':')[0]}] ${task.title}`,
                            description: task.description,
                            status: 'TODO'
                        });
                    }
                }

                setSaved(true);
            }
        } catch (error) {
            console.error('Failed to import requirements to project', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <FileText className="text-orange-500" /> Autopilot Requirement Engine
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Input your client requirements or draft notes. AI will extract milestones and inject tasks straight into the project boards.
                </p>
            </div>

            {/* Input card */}
            <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
                <form onSubmit={handleExtract} className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Raw Requirements text / Client brief
                    </label>
                    <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="e.g. Build a solar monitoring dashboard. It needs an ingestion endpoint for telemetry, time-series graphs on the frontend, visual SLA warnings for late tasks, and a Stripe payment billing invoice generator..."
                        className="input-field min-h-[160px] resize-y font-mono text-xs p-4 leading-relaxed"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !requirements.trim()}
                        className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing Scopes...' : 'Extract Milestones & Tasks'}
                        <Sparkles size={14} className="animate-pulse" />
                    </button>
                </form>
            </div>

            {/* Result card */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="space-y-6"
                    >
                        <div className="glass-card p-6 border-blue-500/25 bg-blue-500/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <span className="text-[8px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded-full uppercase tracking-wider">
                                        Extracted Blueprint
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                                        {result.projectName}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {result.description}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleSaveToWorkspace}
                                    disabled={loading || saved}
                                    className={`btn-primary self-start py-2.5 px-5 text-[10px] font-bold uppercase tracking-wider gap-2 ${
                                        saved ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' : ''
                                    }`}
                                >
                                    {saved ? (
                                        <>
                                            Workspace Imported
                                            <CheckCircle2 size={12} />
                                        </>
                                    ) : (
                                        <>
                                            Import to Workspace
                                            <FolderPlus size={12} />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Milestones accordion */}
                            <div className="space-y-4">
                                {result.milestones.map((milestone, idx) => (
                                    <div key={idx} className="p-4 bg-slate-900/10 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3 border-b border-slate-100 dark:border-slate-850 pb-2">
                                            <ChevronRight size={12} className="text-slate-400" /> {milestone.title}
                                        </h4>
                                        <div className="space-y-3 pl-4">
                                            {milestone.tasks.map((task, tIdx) => (
                                                <div key={tIdx} className="flex justify-between items-start text-xs">
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-white block">
                                                            {task.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block">
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                                        task.priority === 'HIGH' 
                                                            ? 'bg-rose-500/20 text-rose-500' 
                                                            : task.priority === 'MEDIUM' 
                                                                ? 'bg-amber-500/20 text-amber-500' 
                                                                : 'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RequirementEnginePage;
