import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  activeCollegeId: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setActiveCollege: (id: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  activeCollegeId: null,
  isAuthenticated: false,
  loading: true, // Initial loading true for hydration

  login: (token, user) => set({
    token,
    user,
    isAuthenticated: true,
    loading: false,
  }),

  logout: () => set({
    token: null,
    user: null,
    activeCollegeId: null,
    isAuthenticated: false,
    loading: false,
  }),

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setActiveCollege: (id) => set({ activeCollegeId: id }),
}));
