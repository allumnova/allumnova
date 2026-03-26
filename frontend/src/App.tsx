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
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCollegesPage from './pages/AdminCollegesPage';

function App() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
                />

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

                {/* Normal User Routes */}
                <Route element={
                    isAuthenticated ? (
                        user?.role === 'admin' ? <Navigate to="/admin" /> :
                            (user?.is_verified || user?.verificationLevel?.toUpperCase() === 'VERIFIED') ? <MainLayout /> :
                                user?.verificationLevel?.toUpperCase() === 'PENDING' ? <Navigate to="/pending" /> :
                                    <Navigate to="/onboarding" />
                    ) : <Navigate to="/login" />
                }>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/connections" element={<ConnectionsPage />} />
                    <Route path="/notifications" element={<NotificationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/launchpad" element={<LaunchpadPage />} />
                </Route>

                {/* Admin Routes */}
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
    );
}

export default App;
