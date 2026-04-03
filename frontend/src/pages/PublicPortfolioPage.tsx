import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { 
    Download, 
    Linkedin, 
    Globe, 
    ExternalLink, 
    GraduationCap, 
    Briefcase, 
    Code, 
    Award, 
    ChevronRight, 
    User,
    Mail,
    Phone,
    MapPin,
    Layers,
    Rocket,
    Printer
} from 'lucide-react';

const PublicPortfolioPage = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        window.print();
        setTimeout(() => setDownloading(false), 2000);
    };

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await api.get(`/profile/u/${username}`);
                setProfile(res.data.data);
            } catch (err) {
                console.error('Failed to fetch portfolio:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
                <p className="text-slate-500 mb-8">This portfolio hasn't been claimed yet or is private.</p>
                <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold">Back to Allumnova</Link>
            </div>
        );
    }

    // Default categorized skills if none provided
    const skills = profile.techSkills || {};
    const skillCategories = [
        { key: 'Languages', label: 'Languages' },
        { key: 'Frameworks', label: 'Frameworks' },
        { key: 'Databases', label: 'Databases' },
        { key: 'APIs', label: 'APIs/Tools' },
        { key: 'AI_ML', label: 'AI/ML' },
        { key: 'IoT', label: 'IoT/Embedded' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white selection:bg-blue-100">
            {/* Header / Action Bar */}
            <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center print:hidden bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Link to="/" className="flex items-center gap-2 font-black text-blue-600">
                    <Rocket size={20} />
                    <span>ALLUMNOVA</span>
                </Link>
                <button 
                    onClick={handleDownload}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    <Printer size={18} />
                    {downloading ? 'Preparing PDF...' : 'Download Resume'}
                </button>
            </nav>

            <main className="max-w-4xl mx-auto bg-white shadow-2xl my-20 md:my-32 p-8 md:p-16 rounded-none md:rounded-sm border border-slate-200 print:shadow-none print:border-none print:my-0 print:p-0">
                
                {/* 1. Profile Header */}
                <header className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 uppercase">{profile.name}</h1>
                    <div className="flex flex-wrap justify-center items-center gap-1.5 text-sm font-bold text-slate-600">
                        {profile.department && <span>{profile.department}</span>}
                        {profile.department && profile.role && <span className="opacity-30">|</span>}
                        <span className="capitalize">{profile.role}</span>
                        <span className="opacity-30">|</span>
                        <span>{profile.tierLevel} Innovator</span>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs md:text-sm font-medium text-slate-500 italic">
                        {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
                        <span className="flex items-center gap-1"><Mail size={14} /> {profile.email}</span>
                        {profile.linkedIn && (
                            <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                <Linkedin size={14} /> LinkedIn
                            </a>
                        )}
                        {profile.username && (
                            <span className="flex items-center gap-1"><Globe size={14} /> www.allumnova.cloud/u/{profile.username}</span>
                        )}
                    </div>
                </header>

                <div className="space-y-12">
                    
                    {/* 2. Career Objective */}
                    {profile.careerObjective && (
                        <section className="space-y-3">
                            <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Career Objective</h2>
                            <p className="text-sm leading-relaxed font-medium text-slate-700">
                                {profile.careerObjective}
                            </p>
                        </section>
                    )}

                    {/* 3. Technical Skills */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Technical Skills</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                            {skillCategories.map(cat => (
                                skills[cat.key] ? (
                                    <div key={cat.key} className="flex text-sm">
                                        <span className="font-black w-24 flex-shrink-0">{cat.label}:</span>
                                        <span className="text-slate-700 font-medium">{skills[cat.key]}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </section>

                    {/* 4. Experience & Projects */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Professional Experience</h2>
                        <div className="space-y-6">
                            {profile.experience?.length > 0 ? profile.experience.map((exp: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-black text-slate-900">{exp.company}</h3>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                            {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-blue-600">{exp.position}</p>
                                    <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                                        {exp.description}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-xs italic text-slate-400">Professional records summarized on digital platform.</p>
                            )}
                        </div>
                    </section>

                    {/* 5. Projects Showcase */}
                    {profile.projects?.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Key Projects</h2>
                            <div className="space-y-4">
                                {profile.projects.map((project: any) => (
                                    <div key={project.id} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-black text-slate-900">{project.title}</h3>
                                            {project.demoUrl && <span className="text-[10px] uppercase font-bold text-slate-400">View Live Demo ✓</span>}
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-600">
                                            {project.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 6. Education (Table Format) */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Education</h2>
                        <div className="overflow-hidden border border-slate-300">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-300">
                                    <tr>
                                        <th className="px-4 py-2 font-black uppercase text-[10px] tracking-widest border-r border-slate-300">Degree/Board</th>
                                        <th className="px-4 py-2 font-black uppercase text-[10px] tracking-widest border-r border-slate-300">Institute</th>
                                        <th className="px-4 py-2 font-black uppercase text-[10px] tracking-widest border-r border-slate-300 text-center">Year</th>
                                        <th className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-center">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profile.education?.length > 0 ? profile.education.map((edu: any, i: number) => (
                                        <tr key={i} className="border-b border-slate-200 last:border-0 font-medium">
                                            <td className="px-4 py-2 border-r border-slate-200">{edu.degree}</td>
                                            <td className="px-4 py-2 border-r border-slate-200">{edu.school}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 text-center">{new Date(edu.endDate || edu.startDate).getFullYear()}</td>
                                            <td className="px-4 py-2 text-center">{edu.field || 'N/A'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-xs italic text-slate-400 uppercase tracking-widest">Academic records pending authentication</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 7. Achievements & Hobbies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {profile.achievements?.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Achievements</h2>
                                <ul className="list-disc list-inside text-xs space-y-1 text-slate-700 font-medium px-1">
                                    {profile.achievements.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {profile.hobbies?.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1">Hobbies & Interests</h2>
                                <p className="text-xs text-slate-700 font-medium italic">
                                    {profile.hobbies.join(', ')}
                                </p>
                            </section>
                        )}
                    </div>

                </div>

                {/* Footer Info */}
                <footer className="mt-20 pt-8 border-t border-slate-100 text-center print:mt-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        Generated by Allumnova Portfolio Engine
                    </p>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, footer:not(.print-footer) { display: none !important; }
                    body { background: white !important; }
                    main { 
                        margin: 0 !important; 
                        padding: 20mm !important; 
                        width: 100% !important;
                        max-width: none !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
                .profile-scrollbar::-webkit-scrollbar { width: 4px; }
                .profile-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .profile-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default PublicPortfolioPage;
