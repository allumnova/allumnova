import { Home, Search, PlusSquare, MessageSquare, User as UserIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

interface BottomNavProps {
    onPostClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onPostClick }) => {
    const tabs = [
        { icon: Home, label: 'Feed', path: '/' },
        { icon: Search, label: 'Discover', path: '/discover' },
        { icon: PlusSquare, label: 'Post', path: '/post', isCenter: true },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
        { icon: UserIcon, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-8 pt-3 px-6 z-50 transition-colors">
            <div className="max-w-md mx-auto flex items-center justify-between">
                {tabs.map((tab) => {
                    if (tab.isCenter) {
                        return (
                            <button
                                key={tab.path}
                                onClick={onPostClick}
                                className="flex flex-col items-center gap-1 relative"
                            >
                                <div className="bg-gradient-to-tr from-blue-500 to-emerald-500 p-3 rounded-2xl -mt-8 shadow-lg shadow-blue-500/20 text-white transform hover:scale-110 active:scale-95 transition-transform">
                                    <tab.icon size={24} />
                                </div>
                            </button>
                        );
                    }
                    return (
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
                            <tab.icon size={22} strokeWidth={2} />
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
