export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type CustomerType = 'debtor' | 'creditor' | 'neutral';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  notes?: string;
  totalBalance: number;
  contactInfo?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'buy' | 'sell' | 'payment' | 'refund' | 'adjustment';

export interface Transaction {
  id: string;
  type: TransactionType;
  itemId?: string;
  quantity?: number;
  pricePerUnit?: number;
  customerId?: string;
  userId: string;
  date: string;
  notes?: string;
  total: number;
}

export interface Invoice {
  id: string;
  transactionId: string;
  customerId?: string;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  status: 'paid' | 'unpaid' | 'partial';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetTable: string;
  targetId: string;
  timestamp: string;
  description: string;
}