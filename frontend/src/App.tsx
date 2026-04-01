import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import ConnectionsPage from './pages/ConnectionsPage';
import ChatPage from './pages/ChatPage';
import NotificationPage from './pages/NotificationPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import OnboardingPage from './pages/OnboardingPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import MainLayout from './components/MainLayout';
import LaunchpadPage from './pages/LaunchpadPage';
import MentorshipPage from './pages/MentorshipPage';
import HubFeedPage from './pages/HubFeedPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCollegesPage from './pages/AdminCollegesPage';
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
                    {/* ... (rest of routes) ... */}
                    <Route
                        path="/onboarding"
                        element={isAuthenticated ? (
                            user?.is_verified || user?.verificationLevel?.toUpperCase() === 'VERIFIED' ? <Navigate to="/" /> : <OnboardingPage />
                        ) : <Navigate to="/login" />}
                    />

                    <Route
                        path="/pending"
                        element={isAuthenticated ? (
                            (user?.verificationLevel?.toUpperCase() === 'PENDING' || !user?.is_verified) && user?.role !== 'admin' ? <PendingApprovalPage /> : <Navigate to="/" />
                        ) : <Navigate to="/login" />}
                    />

                    <Route element={<MainLayout />}>
                        <Route path="/" element={<FeedPage />} />
                        <Route path="/discover" element={<DiscoverPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/:userId" element={<ProfilePage />} />
                        
                        {/* Protected child routes within MainLayout */}
                        <Route element={
                            isAuthenticated ? (
                                (user?.is_verified || user?.verificationLevel?.toUpperCase() === 'VERIFIED') ? <React.Fragment /> :
                                    user?.verificationLevel?.toUpperCase() === 'PENDING' ? <Navigate to="/pending" /> :
                                        <Navigate to="/onboarding" />
                            ) : <Navigate to="/login" />
                        }>
                            <Route path="/connections" element={<ConnectionsPage />} />
                            <Route path="/notifications" element={<NotificationPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/launchpad" element={<LaunchpadPage />} />
                            <Route path="/mentorship" element={<MentorshipPage />} />
                            <Route path="/hubs/:hubId" element={<HubFeedPage />} />
                        </Route>
                    </Route>

                    <Route path="/admin" element={
                        isAuthenticated && user?.role === 'admin' ? <AdminLayout /> : <Navigate to={isAuthenticated ? "/" : "/login"} />
                    }>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="colleges" element={<AdminCollegesPage />} />
                        <Route path="requests" element={<AdminRequestsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
