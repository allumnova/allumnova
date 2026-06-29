import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice {
    id: string;
    amount: string;
    currency: string;
    status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'VOID';
    dueDate: string;
    createdAt: string;
    client?: {
        name: string;
        email: string;
    };
    payments?: any[];
}

const PaymentsPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentGateway, setPaymentGateway] = useState('STRIPE');
    const [paying, setPaying] = useState(false);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/billing/invoices');
            if (res.data?.success) {
                setInvoices(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        try {
            setPaying(true);
            const res = await api.post(`/billing/invoices/${selectedInvoice.id}/pay`, {
                gateway: paymentGateway,
                amount: parseFloat(selectedInvoice.amount)
            });

            if (res.data?.success) {
                setSelectedInvoice(null);
                await fetchInvoices(); // Refresh status
            }
        } catch (error) {
            console.error('Payment simulation failed', error);
        } finally {
            setPaying(false);
        }
    };

    if (loading && invoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <CreditCard className="text-teal-500" /> Billing & Payments Desk
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track subscriptions, pay accounts invoices, and audit transactional records.
                </p>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Invoices Log
                </h3>

                {invoices.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500">
                        No invoices logged under this organization.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {invoices.map((inv) => (
                            <div key={inv.id} className="glass-card p-6 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Invoice {inv.id.substring(0, 8).toUpperCase()}
                                        </h4>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                            inv.status === 'PAID' 
                                                ? 'bg-emerald-500/20 text-emerald-500' 
                                                : inv.status === 'UNPAID'
                                                    ? 'bg-amber-500/20 text-amber-500'
                                                    : 'bg-rose-500/20 text-rose-500'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-550 dark:text-slate-450 uppercase font-bold">
                                        Client: {inv.client?.name || 'External'} &bull; Due: {new Date(inv.dueDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                        ${parseFloat(inv.amount).toLocaleString()} <span className="text-xs font-bold text-slate-400">{inv.currency}</span>
                                    </span>

                                    {inv.status === 'UNPAID' && (
                                        <button
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="btn-primary py-2 px-4 text-[10px] font-bold uppercase tracking-wider"
                                        >
                                            Pay Now
                                        </button>
                                    )}

                                    {inv.status === 'PAID' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-bold uppercase tracking-wider">
                                            <ShieldCheck size={12} /> Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {selectedInvoice && (
                    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-card max-w-md w-full bg-slate-950/90 border-slate-800 p-6 space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Stripe checkout simulator
                                    </h3>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Invoice reference: {selectedInvoice.id}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedInvoice(null)}
                                    className="text-slate-400 hover:text-white text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Amount widget */}
                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Amount</p>
                                <p className="text-2xl font-black text-white">
                                    ${parseFloat(selectedInvoice.amount).toLocaleString()} <span className="text-sm font-bold text-slate-400">{selectedInvoice.currency}</span>
                                </p>
                            </div>

                            <form onSubmit={handlePaySubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Payment Gateway Provider
                                    </label>
                                    <select
                                        value={paymentGateway}
                                        onChange={(e) => setPaymentGateway(e.target.value)}
                                        className="input-field py-2.5 bg-slate-900 border-slate-800 text-white text-xs"
                                    >
                                        <option value="STRIPE">Stripe Express</option>
                                        <option value="RAZORPAY">Razorpay Checkout</option>
                                        <option value="MANUAL">Manual Wire Transfer</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Simulated Credit Card Number
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="4242 4242 4242 4242"
                                        disabled
                                        className="input-field py-3 bg-slate-900 border-slate-800 text-white text-xs"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={paying}
                                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider gap-2 mt-4"
                                >
                                    {paying ? 'Processing Gateway...' : 'Authorize Transaction'}
                                    <Sparkles size={14} className="animate-pulse" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentsPage;
