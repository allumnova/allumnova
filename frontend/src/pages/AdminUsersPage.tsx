import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, User, MoreVertical, ShieldAlert, FileText } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminUsers', page, searchTerm],
        queryFn: async () => {
            const res = await api.get('/admin/users', { params: { page, search: searchTerm, limit: 10 } });
            return res.data.data;
        }
    });

    const roleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            const res = await api.patch(`/admin/users/${userId}/role`, { role });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });

    const handleRoleChange = (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
            roleMutation.mutate({ userId, role: newRole });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Users</h2>
                    <p className="text-slate-500 text-sm">Manage user accounts and administrative roles.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="pl-10 pr-4 py-2 w-full md:w-80 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1); // Reset page on new search
                        }}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status / College</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : data?.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                data?.users.map((user: any) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                    <User size={12} /> User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900 dark:text-white">
                                                {user.is_verified ? (
                                                    <span className="text-emerald-500 font-medium">Verified</span>
                                                ) : (
                                                    <span className="text-slate-500 font-medium">Unverified / Pending</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
                                                {user.colleges?.length > 0
                                                    ? user.colleges.map((c: any) => c.college.name).join(', ')
                                                    : 'No college linked'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                            <div className="flex items-center justify-end gap-2">
                                                {user.colleges?.[0]?.documentUrl && (
                                                    <a
                                                        href={user.colleges[0].documentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="View Verification Document"
                                                    >
                                                        <FileText size={18} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                    disabled={roleMutation.isPending}
                                                    className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                                                        ? 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                                                        : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                                        }`}
                                                    title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                >
                                                    <ShieldAlert size={18} />
                                                </button>
                                            </div>
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
                            Page {page} of {data.pagination.pages} ({data.pagination.total} users)
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

export default AdminUsersPage;
