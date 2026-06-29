import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, FileText, CheckCircle2, AlertCircle, FileSignature } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface Project {
    id: string;
    name: string;
}

interface Proposal {
    id: string;
    projectName: string;
    content: string;
    amount: number;
    workflowRunId?: string;
    state: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

const ProposalsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([
        {
            id: 'prop_sample_1',
            projectName: 'Project Solar Monitor',
            content: `# Service Agreement: Solar Monitoring OS\n\n- Scope: Ingestion and alerts.\n- Cost: $17,000 USD`,
            amount: 17000.00,
            state: 'APPROVED'
        }
    ]);
    const [selectedProject, setSelectedProject] = useState('');
    const [loading, setLoading] = useState(false);
    const [draftContent, setDraftContent] = useState('');
    const [draftAmount, setDraftAmount] = useState(0);

    // Stepper active states helper
    const getStepStatus = (current: string, target: string) => {
        const order = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'];
        const currentIndex = order.indexOf(current);
        const targetIndex = order.indexOf(target);
        if (currentIndex > targetIndex) return 'completed';
        if (currentIndex === targetIndex) return 'active';
        return 'upcoming';
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                if (res.data?.success) {
                    setProjects(res.data.data);
                    if (res.data.data.length > 0) {
                        setSelectedProject(res.data.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to load projects for proposals', error);
            }
        };
        fetchProjects();
    }, []);

    const handleGenerate = async () => {
        if (!selectedProject) return;

        try {
            setLoading(true);
            const res = await api.post('/ai/proposal/generate', { projectId: selectedProject });
            if (res.data?.success) {
                setDraftContent(res.data.data.proposalContent);
                setDraftAmount(res.data.data.amount);
            }
        } catch (error) {
            console.error('Proposal generation failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = () => {
        if (!draftContent) return;
        const project = projects.find(p => p.id === selectedProject);

        const newProposal: Proposal = {
            id: `prop_${Math.random().toString(36).substring(2, 9)}`,
            projectName: project?.name || 'Workspace Project',
            content: draftContent,
            amount: draftAmount,
            state: 'DRAFT'
        };

        setProposals(prev => [newProposal, ...prev]);
        setDraftContent('');
    };

    const triggerSignature = async (proposal: Proposal) => {
        try {
            setLoading(true);
            
            // 1. Create a Workflow Run for Proposal Sign-off (using our wf_proposal workflow)
            const runRes = await api.post('/workflows/wf_proposal/runs', {
                contextData: {
                    proposalId: proposal.id,
                    amount: proposal.amount,
                    projectName: proposal.projectName
                }
            });

            if (runRes.data?.success) {
                const runId = runRes.data.data.id;

                // 2. Submit for approval state transition
                const submitRes = await api.post(`/workflows/runs/${runId}/transition`, {
                    eventName: 'SUBMIT_FOR_APPROVAL'
                });

                if (submitRes.data?.success) {
                    // Update UI to PENDING_APPROVAL
                    setProposals(prev => prev.map(p => 
                        p.id === proposal.id 
                            ? { ...p, state: 'PENDING_APPROVAL', workflowRunId: runId } 
                            : p
                    ));

                    // 3. Simulate client approving (automatic or manual approve delay)
                    setTimeout(async () => {
                        try {
                            const approveRes = await api.post(`/workflows/runs/${runId}/transition`, {
                                eventName: 'APPROVE'
                            });
                            if (approveRes.data?.success) {
                                setProposals(prev => prev.map(p => 
                                    p.id === proposal.id 
                                        ? { ...p, state: 'APPROVED' } 
                                        : p
                                ));
                                
                                // Auto create an unpaid invoice for this amount
                                await api.post('/billing/invoices', {
                                    clientId: 'usr_client',
                                    amount: proposal.amount,
                                    currency: 'USD',
                                    dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000)
                                });
                            }
                        } catch (e) {
                            console.error('Approve transition failed', e);
                        }
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Workflow signature flow failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Briefcase className="text-rose-500" /> Proposal & Agreement Desk
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Draft, review, and execute client service agreements using cryptographic state-machine signatures.
                </p>
            </div>

            {/* Generator Form */}
            <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    AI Proposal Generator
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Target Project Scope
                        </label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="input-field py-2.5 bg-slate-50 dark:bg-slate-900/50"
                        >
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || projects.length === 0}
                        className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider gap-2 w-full sm:w-auto"
                    >
                        Generate Draft
                        <Sparkles size={14} className="animate-pulse" />
                    </button>
                </div>

                {/* Draft Review Container */}
                {draftContent && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 space-y-4"
                    >
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Draft Content Preview
                        </label>
                        <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl max-h-[300px] overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-350">
                            {draftContent}
                        </div>
                        <div className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Total Estimated Value: <span className="text-blue-500 font-extrabold">${draftAmount.toLocaleString()}</span>
                            </span>
                            <button
                                onClick={handleSaveDraft}
                                className="btn-primary py-2 text-[10px] font-bold uppercase tracking-wider px-4 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10"
                            >
                                Keep Draft & Add List
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* List Proposals */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Workspace Agreements
                </h3>

                {proposals.map((proposal) => (
                    <div key={proposal.id} className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                                    {proposal.projectName}
                                </h4>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                    Ref: {proposal.id} &bull; Value: ${proposal.amount.toLocaleString()}
                                </span>
                            </div>

                            {proposal.state === 'DRAFT' && (
                                <button
                                    onClick={() => triggerSignature(proposal)}
                                    disabled={loading}
                                    className="btn-primary py-2 px-4 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                                >
                                    Sign Cryptographically
                                    <FileSignature size={12} />
                                </button>
                            )}

                            {proposal.state === 'PENDING_APPROVAL' && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    <AlertCircle size={12} />
                                    Awaiting Signatures
                                </div>
                            )}

                            {proposal.state === 'APPROVED' && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} />
                                    Signed & Executed
                                </div>
                            )}
                        </div>

                        {/* Visual Workflow Stepper */}
                        {proposal.state !== 'APPROVED' && proposal.state !== 'DRAFT' && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-sans">1</div>
                                    <span>Drafted</span>
                                </div>
                                <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 mx-4" />
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-sans ${
                                        proposal.state === 'PENDING_APPROVAL' ? 'bg-amber-500 text-white animate-bounce' : 'bg-emerald-500 text-white'
                                    }`}>2</div>
                                    <span className={proposal.state === 'PENDING_APPROVAL' ? 'text-amber-500' : ''}>Awaiting Client</span>
                                </div>
                                <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 mx-4" />
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-sans">3</div>
                                    <span>Signed</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProposalsPage;
