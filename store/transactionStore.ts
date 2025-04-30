import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Invoice } from '@/types/index';
import { useInventoryStore } from './inventoryStore';
import { useCustomerStore } from './customerStore';

interface TransactionState {
  transactions: Transaction[];
  invoices: Invoice[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => string;
  deleteTransaction: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
}

// Sample initial transactions
const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    itemId: '1',
    quantity: 5,
    pricePerUnit: 1000,
    userId: '1',
    customerId: '2',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Restocking laptops',
    total: 5000,
  },
  {
    id: '2',
    type: 'sell',
    itemId: '1',
    quantity: 2,
    pricePerUnit: 1200,
    userId: '2',
    customerId: '1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Customer order',
    total: 2400,
  },
  {
    id: '3',
    type: 'payment',
    userId: '2',
    customerId: '1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Partial payment',
    total: 1000,
  },
];

// Sample initial invoices
const initialInvoices: Invoice[] = [
  {
    id: '1',
    transactionId: '1',
    customerId: '2',
    totalAmount: 5000,
    createdBy: '1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        itemId: '1',
        name: 'Laptop',
        quantity: 5,
        unitPrice: 1000,
        total: 5000,
      },
    ],
    status: 'paid',
  },
  {
    id: '2',
    transactionId: '2',
    customerId: '1',
    totalAmount: 2400,
    createdBy: '2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        itemId: '1',
        name: 'Laptop',
        quantity: 2,
        unitPrice: 1200,
        total: 2400,
      },
    ],
    status: 'partial',
  },
];

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: initialTransactions,
      invoices: initialInvoices,
      
      addTransaction: (transactionData) => {
        const id = Date.now().toString();
        
        const newTransaction: Transaction = {
          ...transactionData,
          id,
          date: new Date().toISOString(),
        };
        
        // Update inventory if this is an item transaction
        if (newTransaction.itemId && newTransaction.quantity) {
          const quantityChange = newTransaction.type === 'buy' 
            ? newTransaction.quantity 
            : -newTransaction.quantity;
            
          const success = useInventoryStore.getState().updateStock(
            newTransaction.itemId, 
            quantityChange
          );
          
          if (!success) {
            throw new Error('Not enough stock available');
          }
        }
        
        // Update customer balance if applicable
        if (newTransaction.customerId) {
          let balanceChange = 0;
          
          switch (newTransaction.type) {
            case 'buy':
              balanceChange = -newTransaction.total; // We owe them money
              break;
            case 'sell':
              balanceChange = newTransaction.total; // They owe us money
              break;
            case 'payment':
              balanceChange = -newTransaction.total; // They paid us, reducing what they owe
              break;
            case 'refund':
              balanceChange = newTransaction.total; // We refunded them, increasing what they owe
              break;
            default:
              balanceChange = 0;
          }
          
          useCustomerStore.getState().updateBalance(
            newTransaction.customerId,
            balanceChange
          );
        }
        
        // Create invoice for this transaction
        if (['buy', 'sell'].includes(newTransaction.type) && newTransaction.itemId) {
          const item = useInventoryStore.getState().items.find(
            item => item.id === newTransaction.itemId
          );
          
          if (item) {
            const newInvoice: Invoice = {
              id: `INV-${id}`,
              transactionId: id,
              customerId: newTransaction.customerId,
              totalAmount: newTransaction.total,
              createdBy: newTransaction.userId,
              createdAt: new Date().toISOString(),
              items: [
                {
                  itemId: item.id,
                  name: item.name,
                  quantity: newTransaction.quantity || 0,
                  unitPrice: newTransaction.pricePerUnit || 0,
                  total: newTransaction.total,
                },
              ],
              status: 'unpaid',
            };
            
            set(state => ({
              invoices: [...state.invoices, newInvoice]
            }));
          }
        }
        
        set(state => ({
          transactions: [...state.transactions, newTransaction]
        }));
        
        return id;
      },
      
      deleteTransaction: (id) => {
        set(state => ({
          transactions: state.transactions.filter(transaction => transaction.id !== id),
          invoices: state.invoices.filter(invoice => invoice.transactionId !== id)
        }));
      },
      
      getInvoice: (id) => {
        return get().invoices.find(invoice => invoice.id === id);
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);