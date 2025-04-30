import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item } from '@/types/index';

interface InventoryState {
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateItem: (id: string, itemData: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  updateStock: (id: string, quantityChange: number) => boolean;
}

// Sample initial inventory items
const initialItems: Item[] = [
  {
    id: '1',
    name: 'Laptop',
    sku: 'LT-001',
    quantity: 10,
    unitPrice: 1200,
    description: 'High-performance laptop for business use',
    category: 'Electronics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Office Chair',
    sku: 'OC-002',
    quantity: 15,
    unitPrice: 150,
    description: 'Ergonomic office chair',
    category: 'Furniture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Wireless Mouse',
    sku: 'WM-003',
    quantity: 30,
    unitPrice: 25,
    description: 'Bluetooth wireless mouse',
    category: 'Accessories',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      
      addItem: (itemData) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const newItem: Item = {
          ...itemData,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        
        set(state => ({
          items: [...state.items, newItem]
        }));
        
        return id;
      },
      
      updateItem: (id, itemData) => {
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  ...itemData, 
                  updatedAt: new Date().toISOString() 
                } 
              : item
          )
        }));
      },
      
      deleteItem: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateStock: (id, quantityChange) => {
        const item = get().items.find(item => item.id === id);
        
        if (!item) return false;
        
        // If selling, check if we have enough stock
        if (quantityChange < 0 && item.quantity + quantityChange < 0) {
          return false;
        }
        
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  quantity: item.quantity + quantityChange,
                  updatedAt: new Date().toISOString() 
                } 
              : item
          )
        }));
        
        return true;
      },
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);