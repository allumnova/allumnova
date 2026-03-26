import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Calendar, Trophy, MessageSquare, Send } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';
import { useCollege } from '../contexts/CollegeContext';
import PostTypeFields from './PostTypeFields';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { activeCollege } = useCollege();
    const [type, setType] = useState<'general' | 'opportunity' | 'event' | 'achievement'>('general');
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const postTypes = [
        { id: 'general', label: 'Thought', icon: MessageSquare, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        { id: 'opportunity', label: 'Opportunity', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'event', label: 'Event', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !activeCollege) return;

        setLoading(true);
        try {
            await api.post('/feed/post', {
                content,
                post_type: type,
                metadata: type !== 'general' ? metadata : null
            });
            onSuccess();
            setContent('');
            setMetadata({});
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

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
                        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 rounded-t-[2.5rem] p-8 z-[101] shadow-2xl transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Create Post</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Type Selection */}
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {postTypes.map((pt) => {
                                const Icon = pt.icon;
                                return (
                                    <button
                                        key={pt.id}
                                        onClick={() => setType(pt.id as any)}
                                        className={clsx(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                                            type === pt.id
                                                ? "border-blue-500/50 bg-blue-500/10"
                                                : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                                        )}
                                    >
                                        <div className={clsx("p-2 rounded-xl", pt.bg, pt.color)}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 transition-colors">{pt.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={type === 'general' ? "Share documented thoughts..." : `Add more details for this ${type}...`}
                                className={clsx(
                                    "w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all resize-none",
                                    type === 'general' ? "h-60 focus:ring-blue-500/50" : "h-24 focus:ring-blue-500/50"
                                )}
                            />

                            <PostTypeFields type={type} metadata={metadata} setMetadata={setMetadata} />

                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-slate-500 max-w-[200px]">
                                    Posting to <span className="text-slate-900 dark:text-white font-medium transition-colors">{activeCollege?.name}</span>
                                </p>
                                <button
                                    type="submit"
                                    disabled={loading || !content.trim()}
                                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? 'Posting...' : (
                                        <>
                                            <span>Post</span>
                                            <Send size={16} />
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

export default CreatePostModal;
