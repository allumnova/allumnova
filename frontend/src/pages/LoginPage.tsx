import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowLeft, KeyRound, LogIn, UserPlus } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';
type SignupStep = 'form' | 'otp';
type ForgotStep = 'email' | 'otp' | 'newPassword';

const LoginPage = () => {
    const [mode, setMode] = useState<AuthMode>('login');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Signup state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupStep, setSignupStep] = useState<SignupStep>('form');
    const [signupOtp, setSignupOtp] = useState('');

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const clearError = () => setError('');

    // ─── LOGIN ───
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
            const { user, token } = res.data.data;
            login(token, user, rememberMe);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── SIGNUP ───
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        try {
            await api.post('/auth/register', {
                email: signupEmail,
                password: signupPassword,
                name: signupName,
            });
            setSignupStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: signupEmail, otp: signupOtp });
            const { user, token } = res.data.data;
            login(token, user);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/onboarding');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── FORGOT PASSWORD ───
    const handleForgotSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: forgotEmail });
            setForgotStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        // Just advance to new password step — OTP will be verified along with password reset
        setForgotStep('newPassword');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: forgotEmail,
                otp: forgotOtp,
                newPassword,
            });
            setMode('login');
            setForgotStep('email');
            setForgotEmail('');
            setForgotOtp('');
            setNewPassword('');
            setError('');
            alert('Password reset successfully! Please log in with your new password.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        clearError();
        setSignupStep('form');
        setForgotStep('email');
    };

    // ─── SHARED INPUT CLASS ───
    const inputClass = 'input-field pl-12 py-3 rounded-xl';

    const btnPrimary = 'btn-primary w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50';

    const renderError = () =>
        error ? (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4"
            >
                {error}
            </motion.p>
        ) : null;

    // ─── LOGIN FORM ───
    const renderLogin = () => (
        <motion.form
            key="login"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onSubmit={handleLogin}
            className="space-y-5"
        >
            {renderError()}
            <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className={inputClass} placeholder="Email address" required />
            </div>
            <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className={inputClass} placeholder="Password" required />
            </div>
            <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-slate-200 dark:border-white/10 rounded-lg group-hover:border-blue-500/50 transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                            <svg className={`w-3 h-3 text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button type="button" onClick={() => switchMode('forgot')}
                    className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
                    Forgot Password?
                </button>
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging in...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <LogIn size={18} /> Log In
                    </span>
                )}
            </button>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')}
                    className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                    Sign Up
                </button>
            </p>
        </motion.form>
    );

    // ─── SIGNUP FORM ───
    const renderSignup = () => (
        <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        >
            {signupStep === 'form' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-5">
                    {renderError()}
                    <div className="relative">
                        <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                            className={inputClass} placeholder="Full Name" required />
                    </div>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                            className={inputClass} placeholder="Email address" required />
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                            className={inputClass} placeholder="Create Password" required minLength={6} />
                    </div>
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending OTP...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <UserPlus size={18} /> Create Account
                            </span>
                        )}
                    </button>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                        Already have an account?{' '}
                        <button type="button" onClick={() => switchMode('login')}
                            className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                            Log In
                        </button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleSignupOtp} className="space-y-5">
                    {renderError()}
                    <div className="text-center mb-4">
                        <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <KeyRound size={28} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            We've sent a 6-digit code to <br />
                            <span className="font-bold text-slate-900 dark:text-white">{signupEmail}</span>
                        </p>
                    </div>
                    <input
                        type="text" value={signupOtp} onChange={(e) => setSignupOtp(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        placeholder="000000" maxLength={6} required autoFocus
                    />
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </span>
                        ) : 'Verify & Continue'}
                    </button>
                    <button type="button" onClick={() => setSignupStep('form')}
                        className="w-full text-slate-400 text-sm hover:text-slate-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} /> Change Email
                    </button>
                </form>
            )}
        </motion.div>
    );

    // ─── FORGOT PASSWORD ───
    const renderForgot = () => (
        <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        >
            {forgotStep === 'email' && (
                <form onSubmit={handleForgotSendOtp} className="space-y-5">
                    {renderError()}
                    <div className="text-center mb-4">
                        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <KeyRound size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
                        <p className="text-slate-500 text-sm mt-1">Enter your email to receive a reset code</p>
                    </div>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                            className={inputClass} placeholder="Email address" required />
                    </div>
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                    <button type="button" onClick={() => switchMode('login')}
                        className="w-full text-slate-400 text-sm hover:text-slate-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                </form>
            )}
            {forgotStep === 'otp' && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-5">
                    {renderError()}
                    <div className="text-center mb-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Enter the 6-digit code sent to <br />
                            <span className="font-bold text-slate-900 dark:text-white">{forgotEmail}</span>
                        </p>
                    </div>
                    <input
                        type="text" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        placeholder="000000" maxLength={6} required autoFocus
                    />
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        Continue
                    </button>
                    <button type="button" onClick={() => setForgotStep('email')}
                        className="w-full text-slate-400 text-sm hover:text-slate-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} /> Change Email
                    </button>
                </form>
            )}
            {forgotStep === 'newPassword' && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    {renderError()}
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set New Password</h3>
                        <p className="text-slate-500 text-sm mt-1">Choose a strong new password</p>
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass} placeholder="New Password" required minLength={6} />
                    </div>
                    <button type="submit" disabled={loading} className={btnPrimary}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm relative z-10 transition-all duration-300"
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        Allumnova
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 transition-colors">
                        {mode === 'login' && 'Welcome back! Log in to your account.'}
                        {mode === 'signup' && 'Create your account to get started.'}
                        {mode === 'forgot' && 'Reset your password securely.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'login' && renderLogin()}
                    {mode === 'signup' && renderSignup()}
                    {mode === 'forgot' && renderForgot()}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoginPage;
