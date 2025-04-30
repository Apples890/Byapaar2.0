import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '@/types/index';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalBalance'>) => string;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  updateBalance: (id: string, amount: number) => void;
}

// Sample initial customers
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'debtor',
    notes: 'Regular client',
    totalBalance: 1500,
    contactInfo: 'contact@acme.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'TechSupplies Inc',
    type: 'creditor',
    notes: 'Supplier for office equipment',
    totalBalance: -2000,
    contactInfo: 'sales@techsupplies.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Freelance Services',
    type: 'neutral',
    totalBalance: 0,
    contactInfo: 'info@freelance.com',
    createdAt: new Date().toISOString(),
  },
];

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: initialCustomers,
      
      addCustomer: (customerData) => {
        const id = Date.now().toString();
        
        const newCustomer: Customer = {
          ...customerData,
          id,
          totalBalance: 0,
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          customers: [...state.customers, newCustomer]
        }));
        
        return id;
      },
      
      updateCustomer: (id, customerData) => {
        set(state => ({
          customers: state.customers.map(customer => 
            customer.id === id ? { ...customer, ...customerData } : customer
          )
        }));
      },
      
      deleteCustomer: (id) => {
        set(state => ({
          customers: state.customers.filter(customer => customer.id !== id)
        }));
      },
      
      updateBalance: (id, amount) => {
        set(state => ({
          customers: state.customers.map(customer => 
            customer.id === id 
              ? { 
                  ...customer, 
                  totalBalance: customer.totalBalance + amount,
                  // Update type based on new balance
                  type: customer.totalBalance + amount > 0 
                    ? 'debtor' 
                    : customer.totalBalance + amount < 0 
                      ? 'creditor' 
                      : 'neutral'
                } 
              : customer
          )
        }));
      },
    }),
    {
      name: 'customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);