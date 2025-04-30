import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuditLog } from '@/types';
import { AuditLog } from '@/types/index';

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

// Sample initial audit logs
const initialLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'create',
    targetTable: 'items',
    targetId: '1',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created new item: Laptop',
  },
  {
    id: '2',
    userId: '1',
    action: 'create',
    targetTable: 'customers',
    targetId: '1',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created new customer: Acme Corporation',
  },
  {
    id: '3',
    userId: '2',
    action: 'transaction',
    targetTable: 'transactions',
    targetId: '2',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created new transaction: Sold 2 Laptops to Acme Corporation',
  },
];

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: initialLogs,
      
      addLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          logs: [...state.logs, newLog]
        }));
      },
      
      clearLogs: () => {
        set({ logs: [] });
      },
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);