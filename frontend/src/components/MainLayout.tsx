import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import CreatePostModal from './CreatePostModal';

const MainLayout: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();
    const queryClient = useQueryClient();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            <TopBar />
            <main className="max-w-[1400px] mx-auto pt-24 pb-32 px-4 min-h-screen flex-1 w-full overflow-x-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <BottomNav onPostClick={() => setIsModalOpen(true)} />

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['feed'] });
                }}
            />
        </div>
    );
};

export default MainLayout;
