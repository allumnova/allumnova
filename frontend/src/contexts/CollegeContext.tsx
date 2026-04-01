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
            let userColleges: College[] = [];
            if (isAuthenticated) {
                const res = await api.get('/colleges');
                userColleges = res.data.data || res.data;
            }
            
            // Always include Global Community at the top
            const updatedColleges = [GLOBAL_COLLEGE, ...userColleges.filter(c => c.id !== GLOBAL_COLLEGE.id)];
            setAllColleges(updatedColleges);

            const savedCollegeId = localStorage.getItem('activeCollegeId');
            if (savedCollegeId) {
                const college = updatedColleges.find((c: College) => c.id === savedCollegeId);
                if (college) {
                    setActiveCollegeState(college);
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            } else {
                // If logged in and has colleges, pick the first user college, else Global
                if (isAuthenticated && userColleges.length > 0) {
                    setActiveCollegeState(userColleges[0]);
                    localStorage.setItem('activeCollegeId', userColleges[0].id);
                } else {
                    setActiveCollegeState(GLOBAL_COLLEGE);
                }
            }
        } catch (err) {
            console.error('Failed to fetch colleges:', err);
            setActiveCollegeState(GLOBAL_COLLEGE);
        }
    };

    useEffect(() => {
        refreshColleges();
    }, [isAuthenticated]);

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
