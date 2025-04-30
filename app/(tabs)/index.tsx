import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCustomerStore } from '@/store/customerStore';
import { useTransactionStore } from '@/store/transactionStore';
import Card from '@/components/Card';
import Colors from '@/constants/Colors';
import { Package, Users, FileText, AlertTriangle } from 'lucide-react-native';

export default function DashboardScreen() {
  const { currentUser } = useAuthStore();
  const { items } = useInventoryStore();
  const { customers } = useCustomerStore();
  const { transactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const lowStockItems = items.filter(item => item.quantity < 5);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const totalInventoryValue = items.reduce(
    (total, item) => total + (item.quantity * item.unitPrice),
    0
  );
  
  const totalDebtorBalance = customers
    .filter(customer => customer.type === 'debtor')
    .reduce((total, customer) => total + customer.totalBalance, 0);
  
  const totalCreditorBalance = customers
    .filter(customer => customer.type === 'creditor')
    .reduce((total, customer) => total + Math.abs(customer.totalBalance), 0);
  
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, we would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.greeting}>Hello, {currentUser?.name}</Text>
      
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Package size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Users size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>{customers.length}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <FileText size={20} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </Card>
      </View>
      
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Financial Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Inventory Value:</Text>
          <Text style={styles.summaryValue}>${totalInventoryValue.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Receivables:</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            ${totalDebtorBalance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Payables:</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            ${totalCreditorBalance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Net Balance:</Text>
          <Text style={[
            styles.summaryValue, 
            { 
              color: totalDebtorBalance - totalCreditorBalance >= 0 
                ? Colors.success 
                : Colors.danger 
            }
          ]}>
            ${(totalDebtorBalance - totalCreditorBalance).toFixed(2)}
          </Text>
        </View>
      </Card>
      
      {lowStockItems.length > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <AlertTriangle size={20} color={Colors.warning} />
            <Text style={styles.alertTitle}>Low Stock Alert</Text>
          </View>
          {lowStockItems.map(item => (
            <View key={item.id} style={styles.alertItem}>
              <Text style={styles.alertItemName}>{item.name}</Text>
              <Text style={styles.alertItemQuantity}>Qty: {item.quantity}</Text>
            </View>
          ))}
        </Card>
      )}
      
      <Card>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {recentTransactions.map(transaction => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionType}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              {
                color: ['sell', 'payment'].includes(transaction.type)
                  ? Colors.success
                  : Colors.danger
              }
            ]}>
              ${transaction.total.toFixed(2)}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.text,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  alertCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 8,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.1)',
  },
  alertItemName: {
    fontSize: 14,
    color: Colors.text,
  },
  alertItemQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.warning,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});