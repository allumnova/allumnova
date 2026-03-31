import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MessageSquare, Briefcase, Calendar, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';
import { Post } from '../types';
import PostTypeFields from './PostTypeFields';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedPost: any) => void;
    post: Post;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ isOpen, onClose, onSuccess, post }) => {
    const [content, setContent] = useState(post.content);
    const [metadata, setMetadata] = useState<any>(post.metadata || {});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setContent(post.content);
            setMetadata(post.metadata || {});
        }
    }, [isOpen, post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const res = await api.patch(`/feed/post/${post.id}`, {
                content,
                metadata
            });
            onSuccess(res.data.data);
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    const typeIcons: any = {
        general: MessageSquare,
        opportunity: Briefcase,
        event: Calendar,
        achievement: Trophy
    };
    const Icon = typeIcons[post.post_type || 'general'] || MessageSquare;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 rounded-t-[2.5rem] p-6 pb-20 z-[101] shadow-2xl transition-colors max-h-[95vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Icon size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Edit Post</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-40 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm"
                            />

                            <PostTypeFields type={post.post_type as any} metadata={metadata} setMetadata={setMetadata} />

                            <div className="flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !content.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20 text-sm"
                                >
                                    {loading ? 'Saving...' : (
                                        <>
                                            <span>Save Changes</span>
                                            <Save size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditPostModal;
