import React, { createContext, useContext, useState, useEffect } from 'react';
import { College } from '../types';
import { useAuth } from './AuthContext';
import api from '../api/axios';

interface CollegeContextType {
    activeCollege: College | null;
    setActiveCollege: (college: College) => void;
    allColleges: College[];
    refreshColleges: () => Promise<void>;
}

const GLOBAL_COLLEGE: College = {
    id: 'cl_global_allumnova',
    name: 'Global Community',
    domain: 'global.allumnova.cloud',
    subdomain: 'global',
    primaryColor: '#3b82f6',
    location: 'Everywhere',
    website: 'https://allumnova.cloud'
};

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [activeCollege, setActiveCollegeState] = useState<College | null>(null);
    const [allColleges, setAllColleges] = useState<College[]>([GLOBAL_COLLEGE]);

    const refreshColleges = async () => {
        try {
            let publicColleges: College[] = [];
            if (isAuthenticated) {
                try {
                const res = await api.get('/colleges');
                const rawData = res.data.data || res.data;
                publicColleges = Array.isArray(rawData) ? rawData : [];
                } catch (apiErr) {
                    console.error('Failed to fetch public colleges:', apiErr);
                }
            }
            
            // Extract user-specific joined colleges (including Pending)
            const membershipColleges: College[] = (Array.isArray(user?.colleges) ? user.colleges : [])
                .filter(m => m && m.status !== 'REJECTED') // Include VERIFIED and PENDING
                .map(m => (m as any).college)
                .filter(Boolean); // Filter out any nulls

            // Merge all sources safely
            const merged = [GLOBAL_COLLEGE, ...membershipColleges, ...publicColleges];
            
            // Deduplicate by ID
            const uniqueCollegesMap = new Map();
            merged.forEach(c => {
                if (c && c.id && !uniqueCollegesMap.has(c.id)) {
                    uniqueCollegesMap.set(c.id, c);
                }
            });
            const finalColleges = Array.from(uniqueCollegesMap.values());
            
            setAllColleges(finalColleges);

            const savedCollegeId = localStorage.getItem('activeCollegeId');
            if (savedCollegeId) {
                const saved = finalColleges.find((c: College) => c.id === savedCollegeId);
                if (saved) {
                    setActiveCollegeState(saved);
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            } else {
                // Priority: Member College > Global
                if (membershipColleges.length > 0) {
                    setActiveCollegeState(membershipColleges[0]);
                    localStorage.setItem('activeCollegeId', membershipColleges[0].id);
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            }
        } catch (err) {
            console.error('Failed to refresh environment:', err);
            setActiveCollegeState(GLOBAL_COLLEGE);
        }
    };

    useEffect(() => {
        refreshColleges();
    }, [isAuthenticated, user?.id]); // Re-run if user identity changes

    const setActiveCollege = (college: College) => {
        setActiveCollegeState(college);
        localStorage.setItem('activeCollegeId', college.id);
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
