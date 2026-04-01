import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Building, Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const AdminCollegesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminColleges', page, searchTerm],
        queryFn: async () => {
            const res = await api.get('/admin/colleges', { params: { page, search: searchTerm, limit: 10 } });
            return res.data.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (collegeId: string) => {
            const res = await api.delete(`/admin/colleges/${collegeId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminColleges'] });
        }
    });

    const handleDelete = (collegeId: string, collegeName: string) => {
        if (window.confirm(`Are you absolutely sure you want to delete ${collegeName}? This action cannot be undone and will detach all associated users.`)) {
            deleteMutation.mutate(collegeId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registered Colleges</h2>
                    <p className="text-slate-500 text-sm">Manage the institutions available on the platform.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or domain..."
                        className="pl-10 pr-4 py-2 w-full md:w-80 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="px-6 py-4 font-medium">Institution Name</th>
                                <th className="px-6 py-4 font-medium">Domain</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Total Users</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Loading colleges...
                                    </td>
                                </tr>
                            ) : (Array.isArray(data?.colleges) && data.colleges.length === 0) || !data?.colleges ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No colleges found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                data?.colleges.map((college: any) => (
                                    <motion.tr
                                        key={college.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold">
                                                    <Building size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{college.name}</p>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{college.subdomain}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            @{college.domain}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                                            {college.location || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                <Users size={14} /> {college._count?.users || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(college.id, college.name)}
                                                disabled={deleteMutation.isPending}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Delete College"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Page {page} of {data.pagination.pages} ({data.pagination.total} colleges)
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 text-sm border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="px-3 py-1 text-sm border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50"
                                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                                disabled={page === data.pagination.pages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCollegesPage;
