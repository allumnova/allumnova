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

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [activeCollege, setActiveCollegeState] = useState<College | null>(null);
    const [allColleges, setAllColleges] = useState<College[]>([]);

    const refreshColleges = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.get('/colleges');
            const colleges = res.data.data || res.data; // handle both {success, data} and raw array
            setAllColleges(colleges);

            const savedCollegeId = localStorage.getItem('activeCollegeId');
            if (savedCollegeId) {
                const college = colleges.find((c: College) => c.id === savedCollegeId);
                if (college) setActiveCollegeState(college);
            } else if (colleges.length > 0) {
                setActiveCollegeState(colleges[0]);
                localStorage.setItem('activeCollegeId', colleges[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch colleges:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshColleges();
        } else {
            setAllColleges([]);
            setActiveCollegeState(null);
        }
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
