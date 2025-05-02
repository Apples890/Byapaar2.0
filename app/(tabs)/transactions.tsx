import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTransactionStore } from '@/store/transactionStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { Transaction, TransactionType } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import Colors from '@/constants/Colors';
import { Plus, FileText, Search, X, Filter } from 'lucide-react-native';

export default function TransactionsScreen() {
  const { transactions, addTransaction } = useTransactionStore();
  const { items } = useInventoryStore();
  const { customers } = useCustomerStore();
  const { currentUser } = useAuthStore();
  const { addLog } = useAuditStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  
  // Form state
  const [type, setType] = useState<TransactionType>('sell');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  
  const filteredTransactions = transactions
    .filter(transaction => 
      filterType === 'all' || transaction.type === filterType
    )
    .filter(transaction => {
      if (!searchQuery) return true;
      
      const item = transaction.itemId 
        ? items.find(i => i.id === transaction.itemId) 
        : null;
        
      const customer = transaction.customerId 
        ? customers.find(c => c.id === transaction.customerId) 
        : null;
        
      return (
        (item && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.notes && transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const resetForm = () => {
    setType('sell');
    setSelectedItemId('');
    setQuantity('');
    setPricePerUnit('');
    setSelectedCustomerId('');
    setNotes('');
    setAmount('');
  };
  
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };
  
  const handleSave = () => {
    try {
      if (['buy', 'sell'].includes(type)) {
        // Item transaction
        if (!selectedItemId || !quantity || !pricePerUnit) {
          Alert.alert('Error', 'Please fill all required fields');
          return;
        }
        
        if (isNaN(Number(quantity)) || isNaN(Number(pricePerUnit))) {
          Alert.alert('Error', 'Quantity and price must be numbers');
          return;
        }
        
        const total = Number(quantity) * Number(pricePerUnit);
        
        const newTransactionId = addTransaction({
          type: type as TransactionType,
          itemId: selectedItemId,
          quantity: Number(quantity),
          pricePerUnit: Number(pricePerUnit),
          customerId: selectedCustomerId || undefined,
          userId: currentUser?.id || '',
          notes,
          total,
        });
        
        // Add audit log
        const item = items.find(i => i.id === selectedItemId);
        const customer = selectedCustomerId 
          ? customers.find(c => c.id === selectedCustomerId) 
          : null;
          
        addLog({
          userId: currentUser?.id || '',
          action: 'transaction',
          targetTable: 'transactions',
          targetId: newTransactionId,
          description: `Created new ${type} transaction: ${quantity} ${item?.name || 'items'} ${customer ? `with ${customer.name}` : ''}`,
        });
      } else {
        // Payment, refund, or adjustment
        if (!amount) {
          Alert.alert('Error', 'Please enter an amount');
          return;
        }
        
        if (isNaN(Number(amount))) {
          Alert.alert('Error', 'Amount must be a number');
          return;
        }
        
        if (!selectedCustomerId) {
          Alert.alert('Error', 'Please select a customer');
          return;
        }
        
        const newTransactionId = addTransaction({
          type: type as TransactionType,
          customerId: selectedCustomerId,
          userId: currentUser?.id || '',
          notes,
          total: Number(amount),
        });
        
        // Add audit log
        const customer = customers.find(c => c.id === selectedCustomerId);
        
        addLog({
          userId: currentUser?.id || '',
          action: 'transaction',
          targetTable: 'transactions',
          targetId: newTransactionId,
          description: `Created new ${type} transaction: $${amount} ${customer ? `with ${customer.name}` : ''}`,
        });
      }
      
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, we would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const getTransactionStatusInfo = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'buy':
        return { status: 'danger' as const, text: 'Buy' };
      case 'sell':
        return { status: 'success' as const, text: 'Sell' };
      case 'payment':
        return { status: 'info' as const, text: 'Payment' };
      case 'refund':
        return { status: 'warning' as const, text: 'Refund' };
      case 'adjustment':
        return { status: 'neutral' as const, text: 'Adjustment' };
      default:
        return { status: 'neutral' as const, text: 'Unknown' };
    }
  };
  
  const renderItem = ({ item }: { item: Transaction }) => {
    const statusInfo = getTransactionStatusInfo(item);
    const transactionDate = new Date(item.date).toLocaleDateString();
    
    const item_details = item.itemId 
      ? items.find(i => i.id === item.itemId) 
      : null;
      
    const customer = item.customerId 
      ? customers.find(c => c.id === item.customerId) 
      : null;
    
    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <StatusBadge status={statusInfo.status} text={statusInfo.text} />
          <Text style={styles.transactionDate}>{transactionDate}</Text>
        </View>
        
        {item_details && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Item:</Text>
            <Text style={styles.detailValue}>{item_details.name}</Text>
          </View>
        )}
        
        {item.quantity && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
        )}
        
        {item.pricePerUnit && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit Price:</Text>
            <Text style={styles.detailValue}>${item.pricePerUnit.toFixed(2)}</Text>
          </View>
        )}
        
        {customer && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{customer.name}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={[
            styles.detailValue, 
            styles.totalValue,
            { 
              color: ['sell', 'payment'].includes(item.type) 
                ? Colors.success 
                : Colors.danger 
            }
          ]}>
            ${item.total.toFixed(2)}
          </Text>
        </View>
        
        {item.notes && (
          <Text style={styles.notes}>{item.notes}</Text>
        )}
      </Card>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Alert.alert(
              'Filter Transactions',
              'Select transaction type',
              [
                { text: 'All', onPress: () => setFilterType('all') },
                { text: 'Buy', onPress: () => setFilterType('buy') },
                { text: 'Sell', onPress: () => setFilterType('sell') },
                { text: 'Payment', onPress: () => setFilterType('payment') },
                { text: 'Refund', onPress: () => setFilterType('refund') },
                { text: 'Adjustment', onPress: () => setFilterType('adjustment') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Filter size={20} color={filterType !== 'all' ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>
        <Button
          title="Add"
          onPress={openAddModal}
          size="small"
          style={styles.addButton}
        />
      </View>
      
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No transactions found"
            description={
              searchQuery || filterType !== 'all'
                ? "Try adjusting your search or filter"
                : "Add your first transaction to get started"
            }
            buttonTitle={searchQuery || filterType !== 'all' ? undefined : "Add Transaction"}
            onButtonPress={searchQuery || filterType !== 'all' ? undefined : openAddModal}
            icon={<FileText size={48} color={Colors.textSecondary} />}
          />
        }
      />
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Transaction</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'buy' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('buy')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'buy' && styles.selectedTypeButtonText,
                  ]}
                >
                  Buy
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'sell' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('sell')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'sell' && styles.selectedTypeButtonText,
                  ]}
                >
                  Sell
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'payment' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('payment')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'payment' && styles.selectedTypeButtonText,
                  ]}
                >
                  Payment
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'refund' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('refund')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'refund' && styles.selectedTypeButtonText,
                  ]}
                >
                  Refund
                </Text>
              </TouchableOpacity>
            </View>
            
            {['buy', 'sell'].includes(type) ? (
              <>
                <Text style={styles.label}>Item</Text>
                <View style={styles.pickerContainer}>
                  {items.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerItem,
                        selectedItemId === item.id && styles.selectedPickerItem,
                      ]}
                      onPress={() => {
                        setSelectedItemId(item.id);
                        setPricePerUnit(item.unitPrice.toString());
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedItemId === item.id && styles.selectedPickerItemText,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.row}>
                  <Input
                    label="Quantity"
                    placeholder="0"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    containerStyle={styles.halfInput}
                  />
                  
                  <Input
                    label="Unit Price ($)"
                    placeholder="0.00"
                    value={pricePerUnit}
                    onChangeText={setPricePerUnit}
                    keyboardType="numeric"
                    containerStyle={styles.halfInput}
                  />
                </View>
              </>
            ) : (
              <Input
                label="Amount ($)"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            )}
            
            <Text style={styles.label}>Customer (Optional)</Text>
            <View style={styles.pickerContainer}>
              {customers.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  style={[
                    styles.pickerItem,
                    selectedCustomerId === customer.id && styles.selectedPickerItem,
                  ]}
                  onPress={() => setSelectedCustomerId(customer.id)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedCustomerId === customer.id && styles.selectedPickerItemText,
                    ]}
                    numberOfLines={1}
                  >
                    {customer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Input
              label="Notes (Optional)"
              placeholder="Transaction notes"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleSave}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    zIndex: 1,
    left: 10,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: Colors.textSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.text,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 12,
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPickerItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerItemText: {
    color: Colors.text,
  },
  selectedPickerItemText: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 12,
  },
});