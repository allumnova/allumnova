import React, { createContext, useContext, useState, useEffect } from 'react';
import { College } from '../types';
import { useAuth } from './AuthContext';
import api from '../api/axios';

interface CollegeContextType {
    activeCollege: any | null;
    setActiveCollege: (college: any) => void;
    allColleges: any[];
    refreshColleges: () => Promise<void>;
}

const GLOBAL_COLLEGE: any = {
    id: 'cl_global_allumnova',
    name: 'Global Community',
    domain: 'global.allumnova.cloud',
    subdomain: 'global',
    primaryColor: '#3b82f6',
    location: 'Everywhere',
    website: 'https://allumnova.cloud',
    category: 'GLOBAL',
    type: 'HUB',
    icon: '🌐'
};

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [activeCollege, setActiveCollegeState] = useState<any | null>(null);
    const [allColleges, setAllColleges] = useState<any[]>([GLOBAL_COLLEGE]);

    const refreshColleges = async () => {
        try {
            // Extract user-specific joined environments (Filtered for APPROVED or legacy VERIFIED status)
            const membershipEnvironments: any[] = (Array.isArray((user as any)?.environments) ? (user as any).environments : [])
                .filter((m: any) => m && (m.status === 'APPROVED' || m.status === 'VERIFIED' || user?.role === 'admin'))
                .map((m: any) => m.environment)
                .filter(Boolean);

            // Merged list for the switcher - Priority: Member Environments > Global
            const merged = [...membershipEnvironments, GLOBAL_COLLEGE];
            
            // Deduplicate by ID
            const uniqueMap = new Map();
            merged.forEach(c => {
                if (c && c.id && !uniqueMap.has(c.id)) {
                    uniqueMap.set(c.id, c);
                }
            });
            const finalEnvironments = Array.from(uniqueMap.values());
            
            setAllColleges(finalEnvironments);

            const savedCollegeId = localStorage.getItem('activeCollegeId');
            if (savedCollegeId) {
                const saved = finalEnvironments.find((c: any) => c.id === savedCollegeId);
                if (saved) {
                    setActiveCollegeState(saved);
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            } else {
                if (membershipEnvironments.length > 0) {
                    setActiveCollegeState(membershipEnvironments[0]);
                    localStorage.setItem('activeCollegeId', membershipEnvironments[0].id);
                    if (membershipEnvironments[0].collegeId) {
                        localStorage.setItem('activeCampusCollegeId', membershipEnvironments[0].collegeId);
                    } else {
                        localStorage.setItem('activeCampusCollegeId', 'cl_global_allumnova');
                    }
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            }
        } catch (err) {
            console.error('Failed to refresh environments:', err);
            setActiveCollegeState(GLOBAL_COLLEGE);
        }
    };

    useEffect(() => {
        refreshColleges();
    }, [isAuthenticated, user?.id, (user as any)?.environments]); // Re-run if user identity or environments change

    const setActiveCollege = (college: any) => {
        setActiveCollegeState(college);
        localStorage.setItem('activeCollegeId', college.id);
        if (college.collegeId) {
            localStorage.setItem('activeCampusCollegeId', college.collegeId);
        } else {
            localStorage.setItem('activeCampusCollegeId', 'cl_global_allumnova');
        }
    };

    return (
        <CollegeContext.Provider value={{ activeCollege, setActiveCollege, allColleges, refreshColleges }}>
            {children}
        </CollegeContext.Provider>
    );
};

export const useCollege = () => {
    const context = useContext(CollegeContext);
    if (context === undefined) {
        throw new Error('useCollege must be used within a CollegeProvider');
    }
    return context;
};
