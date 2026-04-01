import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon, Shield, GraduationCap, FileText, CheckCircle,
    ChevronRight, ChevronLeft, Upload, Search, Building2, X, Globe, MapPin, Info
} from 'lucide-react';

const OnboardingPage = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [colleges, setColleges] = useState<any[]>([]);
    const [collegeSearch, setCollegeSearch] = useState('');
    const [showSuggestModal, setShowSuggestModal] = useState(false);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        linkedIn: '',
        collegeId: '',
        role: 'student',
        batch: '',
    });

    const [suggestData, setSuggestData] = useState({
        name: '',
        subdomain: '',
        website: '',
        location: '',
        description: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCollegeName, setSelectedCollegeName] = useState('');

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await api.get('/colleges');
                setColleges(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchColleges();
    }, []);

    const filteredColleges = useMemo(() => {
        if (!collegeSearch.trim()) return colleges;
        return colleges.filter(c =>
            c.name.toLowerCase().includes(collegeSearch.toLowerCase())
        );
    }, [colleges, collegeSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSelectCollege = (college: any) => {
        setFormData({ ...formData, collegeId: college.id });
        setSelectedCollegeName(college.name);
        setCollegeSearch(college.name);
    };

    const handleSuggestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSuggestData({ ...suggestData, [e.target.name]: e.target.value });
    };

    const handleSuggestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuggestLoading(true);
        try {
            await api.post('/colleges/suggest', suggestData);
            alert('College suggestion submitted! Admin will review it.');
            setShowSuggestModal(false);
            setSuggestData({ name: '', subdomain: '', website: '', location: '', description: '' });
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to submit suggestion.');
        } finally {
            setSuggestLoading(false);
        }
    };

    const handleOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please upload a verification document.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            data.append('document', selectedFile);

            const res = await api.post('/profile/onboarding', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.data } as User;
                login(localStorage.getItem('token') || '', updatedUser);
                setStep(4);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || 'Onboarding failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white text-sm';
    const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2';

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserIcon size={32} />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Tell us about yourself</h2>
                            <p className="text-slate-500 text-sm">Let others know who you are</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Display Name</label>
                                <input name="name" value={formData.name} onChange={handleChange}
                                    className={inputClass} placeholder="Enter your name" />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input name="phone" value={formData.phone} onChange={handleChange}
                                    className={inputClass} placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className={labelClass}>LinkedIn Profile URL</label>
                                <input name="linkedIn" value={formData.linkedIn} onChange={handleChange}
                                    className={inputClass} placeholder="https://linkedin.com/in/username" />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)}
                            disabled={!formData.name.trim()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                            Next <ChevronRight size={20} />
                        </button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <GraduationCap size={32} />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Your College</h2>
                            <p className="text-slate-500 text-sm">Search and select your campus</p>
                        </div>

                        {/* College Search */}
                        <div>
                            <label className={labelClass}>Search College</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={collegeSearch}
                                    onChange={(e) => {
                                        setCollegeSearch(e.target.value);
                                        if (formData.collegeId && e.target.value !== selectedCollegeName) {
                                            setFormData({ ...formData, collegeId: '' });
                                            setSelectedCollegeName('');
                                        }
                                    }}
                                    className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white text-sm"
                                    placeholder="Type to search colleges..."
                                />
                            </div>

                            {/* College List */}
                            {!formData.collegeId && (
                                <div className="mt-3 max-h-40 overflow-y-auto space-y-2 scrollbar-thin">
                                    {filteredColleges.length > 0 ? (
                                        filteredColleges.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleSelectCollege(c)}
                                                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.primaryColor + '20', color: c.primaryColor }}>
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</p>
                                                    <p className="text-xs text-slate-500">{c.domain || `${c.subdomain}.allumnova.com`}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-slate-500 text-sm">
                                            <p>No colleges found.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected College Badge */}
                            {formData.collegeId && (
                                <div className="mt-3 flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/30 rounded-xl">
                                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex-1">{selectedCollegeName}</p>
                                    <button type="button" onClick={() => {
                                        setFormData({ ...formData, collegeId: '' });
                                        setSelectedCollegeName('');
                                        setCollegeSearch('');
                                    }} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Suggest College */}
                            <div className="mt-3 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowSuggestModal(true)}
                                    className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors inline-flex items-center gap-1"
                                >
                                    <Info size={12} /> My college is not listed — suggest it
                                </button>
                            </div>
                        </div>

                        {/* Role & Batch */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}
                                    className={inputClass}>
                                    <option value="student">Student</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="faculty">Faculty</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Batch (Year)</label>
                                <input name="batch" value={formData.batch} onChange={handleChange}
                                    className={inputClass} placeholder="e.g. 2024" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2">
                                <ChevronLeft size={20} /> Back
                            </button>
                            <button onClick={() => setStep(3)}
                                disabled={!formData.collegeId}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Verify Identity</h2>
                            <p className="text-slate-500 text-sm">Upload a valid ID or college document</p>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-10 border-2 border-dashed rounded-[2.5rem] text-center cursor-pointer transition-all ${selectedFile ? 'border-green-500 bg-green-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-blue-500'}`}
                        >
                            <input
                                type="file" ref={fileInputRef} onChange={handleFileChange}
                                className="hidden" accept=".pdf,image/*"
                            />
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <CheckCircle size={48} className="mx-auto text-green-500" />
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate px-4">{selectedFile.name}</p>
                                    <p className="text-[10px] text-slate-500">Click to change file</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                                        <Upload size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload document</p>
                                        <p className="text-xs text-slate-500 mt-1">PDF or image (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(2)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2">
                                <ChevronLeft size={20} /> Back
                            </button>
                            <button onClick={handleOnboarding}
                                disabled={loading || !selectedFile}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                {loading ? 'Submitting...' : 'Finish Setup'} <CheckCircle size={20} />
                            </button>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-bold dark:text-white mb-4">Verification Pending!</h2>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">
                            Your details have been submitted for approval. You'll receive full access once an admin verifies your identity.
                        </p>
                        <button onClick={() => {
                            window.location.href = '/pending';
                        }}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all">
                            Proceed to Status
                        </button>
                    </motion.div>
                );
        }
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-6 pt-16 transition-colors duration-300">
                <div className="max-w-md w-full relative">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 dark:text-blue-400 mb-2">ALLUMNOVA</h1>
                            <div className="flex gap-2 w-32">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`} />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl"
                        >
                            <X size={14} /> Logout
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-2xl shadow-blue-500/5">
                        {renderStep()}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
                        <Shield size={14} />
                        <span className="text-xs">Secure Verification System</span>
                    </div>
                </div>
            </div>

            {/* ─── Suggest College Modal ─── */}
            <AnimatePresence>
                {showSuggestModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowSuggestModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suggest a College</h3>
                                    <p className="text-xs text-slate-500 mt-1">Admin will review your suggestion</p>
                                </div>
                                <button onClick={() => setShowSuggestModal(false)}
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSuggestSubmit} className="space-y-4">
                                <div>
                                    <label className={labelClass}>College Name *</label>
                                    <div className="relative">
                                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="name" value={suggestData.name} onChange={handleSuggestChange}
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g. Stanford University" required />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>College Website</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="website" value={suggestData.website} onChange={handleSuggestChange}
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g. stanford.edu" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="location" value={suggestData.location} onChange={handleSuggestChange}
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="City, State" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="location" value={suggestData.location} onChange={handleSuggestChange}
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="City, State" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" value={suggestData.description} onChange={handleSuggestChange}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none dark:text-white text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Brief description of the college" rows={3} />
                                </div>
                                <button type="submit" disabled={suggestLoading || !suggestData.name}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2">
                                    {suggestLoading ? 'Submitting...' : 'Submit Suggestion'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OnboardingPage;
