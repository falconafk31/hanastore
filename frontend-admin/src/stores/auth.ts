import { create } from 'zustand';

type User = { id: string; name: string; email: string; role: string } | null;

interface State {
  user: User;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  token: localStorage.getItem('adminToken'),
  setAuth: (user, token) => {
    localStorage.setItem('adminToken', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ user: null, token: null });
  },
}));
