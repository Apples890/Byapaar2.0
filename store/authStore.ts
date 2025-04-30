import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

// Mock initial admin user
const initialAdmin: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// Mock employee user
const initialEmployee: User = {
  id: '2',
  name: 'Employee User',
  email: 'employee@example.com',
  role: 'employee',
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [initialAdmin, initialEmployee],
      
      login: async (email, password) => {
        // In a real app, this would validate against a backend
        // For demo purposes, we'll just check against our mock users
        const users = get().users;
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          // In a real app, we would verify the password here
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          users: [...state.users, newUser]
        }));
      },
      
      updateUser: (id, userData) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, ...userData } : user
          )
        }));
      },
      
      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);