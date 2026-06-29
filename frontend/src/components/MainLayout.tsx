import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MainLayout: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            <TopBar />
            <main className="max-w-[1440px] mx-auto pt-24 pb-32 px-4 min-h-screen flex-1 w-full overflow-x-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* 👤 Left Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-28 space-y-6">
                            <LeftSidebar />
                        </div>
                    </div>

                    {/* ⚡ Center Column */}
                    <div className="col-span-1 lg:col-span-6 max-w-2xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 📊 Right Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-28 space-y-6">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;
