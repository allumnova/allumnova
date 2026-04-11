import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  login: (token, user) => set({
    token,
    user,
    isAuthenticated: true,
  }),

  logout: () => set({
    token: null,
    user: null,
    isAuthenticated: false,
  }),

  setUser: (user) => set({ user }),
}));
