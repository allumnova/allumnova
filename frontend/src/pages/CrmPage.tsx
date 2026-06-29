import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, RefreshCw, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface Deal {
    id: string;
    name: string;
    description: string;
    status: string;
    updatedAt: string;
}

const CrmPage = () => {
    const [pipeline, setPipeline] = useState<{ [key: string]: Deal[] }>({
        LEAD: [],
        PROPOSAL_SENT: [],
        NEGOTIATION: [],
        CLOSED_WON: []
    });
    const [loading, setLoading] = useState(true);

    const fetchPipeline = async () => {
        try {
            setLoading(true);
            const res = await api.get('/crm/pipeline');
            if (res.data?.success) {
                setPipeline(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load CRM pipeline', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipeline();
    }, []);

    const updateDealStage = async (dealId: string, currentStage: string) => {
        const order = ['IDEA', 'BUILDING', 'MVP', 'SCALING']; // maps to LEAD, PROPOSAL_SENT, NEGOTIATION, CLOSED_WON
        const currentIdx = order.indexOf(currentStage);
        if (currentIdx === -1 || currentIdx === order.length - 1) return;

        const nextStage = order[currentIdx + 1];

        try {
            setLoading(true);
            const res = await api.patch(`/crm/pipeline/${dealId}`, { stage: nextStage });
            if (res.data?.success) {
                await fetchPipeline();
            }
        } catch (error) {
            console.error('Failed to transition deal stage', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageTitle = (key: string) => {
        switch (key) {
            case 'LEAD': return 'Lead Opportunity';
            case 'PROPOSAL_SENT': return 'Proposal Sent';
            case 'NEGOTIATION': return 'In Negotiation';
            case 'CLOSED_WON': return 'Closed Won';
            default: return key;
        }
    };

    const getStageColor = (key: string) => {
        switch (key) {
            case 'LEAD': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'PROPOSAL_SENT': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'NEGOTIATION': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'CLOSED_WON': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    if (loading && Object.values(pipeline).every(arr => arr.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Target className="text-amber-500" /> CRM Sales Pipeline
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Orchestrate deals, lead pipelines, and customer proposals conversions.
                    </p>
                </div>

                <button 
                    onClick={fetchPipeline}
                    className="btn-secondary p-2.5 rounded-xl"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
                {Object.keys(pipeline).map((key) => {
                    const deals = pipeline[key] || [];
                    return (
                        <div key={key} className="glass-card p-4 min-w-[250px] bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800 space-y-4">
                            {/* Column Header */}
                            <div className={`p-3 border rounded-xl flex justify-between items-center ${getStageColor(key)}`}>
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                    {getStageTitle(key)}
                                </span>
                                <span className="text-xs font-bold font-mono bg-white/10 px-2 py-0.5 rounded-lg">
                                    {deals.length}
                                </span>
                            </div>

                            {/* Deals List */}
                            <div className="space-y-3">
                                {deals.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 py-6 text-center italic">
                                        Empty stage
                                    </p>
                                ) : (
                                    deals.map((deal) => (
                                        <div 
                                            key={deal.id} 
                                            className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 hover:shadow-lg transition-shadow"
                                        >
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1 truncate">
                                                    {deal.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                    {deal.description}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-900">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                    Ref: {deal.id.substring(0,8)}
                                                </span>

                                                {key !== 'CLOSED_WON' && (
                                                    <button
                                                        onClick={() => updateDealStage(deal.id, deal.status)}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-blue-500 transition-colors flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider"
                                                        title="Advance Pipeline Stage"
                                                    >
                                                        Advance
                                                        <ChevronRight size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CrmPage;
