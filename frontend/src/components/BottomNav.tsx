import { LayoutDashboard, FileText, Sparkles, Briefcase, CreditCard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import React from 'react';

const BottomNav: React.FC = () => {
    const tabs = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Requirements', path: '/requirements' },
        { icon: Sparkles, label: 'AI Desk', path: '/consultant' },
        { icon: Briefcase, label: 'Proposals', path: '/proposals' },
        { icon: CreditCard, label: 'Payments', path: '/payments' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-8 pt-3 px-6 z-50 transition-colors lg:hidden">
            <div className="max-w-md mx-auto flex items-center justify-between">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                            )
                        }
                    >
                        <tab.icon size={20} strokeWidth={2} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">{tab.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
