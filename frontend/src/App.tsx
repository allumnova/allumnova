import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RequirementEnginePage from './pages/RequirementEnginePage';
import AiConsultantPage from './pages/AiConsultantPage';
import ProposalsPage from './pages/ProposalsPage';
import PaymentsPage from './pages/PaymentsPage';
import CrmPage from './pages/CrmPage';
import ProjectsPage from './pages/ProjectsPage';
import AdminPanel from './pages/AdminPanel';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

function App() {
    const { isAuthenticated, user, loading } = useAuth();

    const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AnimatePresence>
                    {isOffline && (
                        <motion.div 
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="fixed top-0 inset-x-0 z-[100] p-4 flex justify-center pointer-events-none"
                        >
                            <div className="bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-rose-500/30 flex items-center gap-3 pointer-events-auto">
                                <WifiOff size={20} />
                                <span className="text-sm font-bold">You are currently offline. Check your connection.</span>
                                <button onClick={() => setIsOffline(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Routes>
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
                    />

                    <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/requirements" element={<RequirementEnginePage />} />
                        <Route path="/consultant" element={<AiConsultantPage />} />
                        <Route path="/proposals" element={<ProposalsPage />} />
                        <Route path="/payments" element={<PaymentsPage />} />
                        
                        {/* Internal Ops (Restricted for Clients) */}
                        <Route element={user?.role !== 'CLIENT' ? <Outlet /> : <Navigate to="/" />}>
                            <Route path="/crm" element={<CrmPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                        </Route>

                        {/* Admin Panel */}
                        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPanel /> : <Navigate to="/" />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
