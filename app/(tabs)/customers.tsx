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
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { Customer, CustomerType } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import Colors from '@/constants/Colors';
import { Plus, Users, Search, X, Edit, Trash } from 'lucide-react-native';

export default function CustomersScreen() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const { currentUser } = useAuthStore();
  const { addLog } = useAuditStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('neutral');
  const [notes, setNotes] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.contactInfo && customer.contactInfo.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const resetForm = () => {
    setName('');
    setType('neutral');
    setNotes('');
    setContactInfo('');
    setEditingCustomer(null);
  };
  
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };
  
  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setType(customer.type);
    setNotes(customer.notes || '');
    setContactInfo(customer.contactInfo || '');
    setModalVisible(true);
  };
  
  const handleSave = () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a customer name');
      return;
    }
    
    if (editingCustomer) {
      // Update existing customer
      updateCustomer(editingCustomer.id, {
        name,
        type,
        notes,
        contactInfo,
      });
      
      // Add audit log
      addLog({
        userId: currentUser?.id || '',
        action: 'update',
        targetTable: 'customers',
        targetId: editingCustomer.id,
        description: `Updated customer: ${name}`,
      });
    } else {
      // Add new customer
      const newCustomerId = addCustomer({
        name,
        type,
        notes,
        contactInfo,
      });
      
      // Add audit log
      addLog({
        userId: currentUser?.id || '',
        action: 'create',
        targetTable: 'customers',
        targetId: newCustomerId,
        description: `Created new customer: ${name}`,
      });
    }
    
    setModalVisible(false);
    resetForm();
  };
  
  const handleDelete = (customer: Customer) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCustomer(customer.id);
            
            // Add audit log
            addLog({
              userId: currentUser?.id || '',
              action: 'delete',
              targetTable: 'customers',
              targetId: customer.id,
              description: `Deleted customer: ${customer.name}`,
            });
          }
        },
      ]
    );
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, we would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const getCustomerStatusInfo = (customer: Customer) => {
    if (customer.type === 'debtor') {
      return { 
        status: 'success' as const, 
        text: 'Debtor',
        balanceText: `Owes $${customer.totalBalance.toFixed(2)}`
      };
    } else if (customer.type === 'creditor') {
      return { 
        status: 'danger' as const, 
        text: 'Creditor',
        balanceText: `Owed $${Math.abs(customer.totalBalance).toFixed(2)}`
      };
    } else {
      return { 
        status: 'neutral' as const, 
        text: 'Neutral',
        balanceText: 'No balance'
      };
    }
  };
  
  const renderItem = ({ item }: { item: Customer }) => {
    const statusInfo = getCustomerStatusInfo(item);
    
    return (
      <Card style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerName}>{item.name}</Text>
          <View style={styles.customerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Edit size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Trash size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.customerDetails}>
          <StatusBadge status={statusInfo.status} text={statusInfo.text} />
          <Text style={styles.balanceText}>{statusInfo.balanceText}</Text>
        </View>
        
        {item.contactInfo && (
          <Text style={styles.contactInfo}>{item.contactInfo}</Text>
        )}
        
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
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
        <Button
          title="Add"
          onPress={openAddModal}
          size="small"
          style={styles.addButton}
        />
      </View>
      
      <FlatList
        data={filteredCustomers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No customers found"
            description={
              searchQuery 
                ? "Try adjusting your search" 
                : "Add your first customer to get started"
            }
            buttonTitle={searchQuery ? undefined : "Add Customer"}
            onButtonPress={searchQuery ? undefined : openAddModal}
            icon={<Users size={48} color={Colors.textSecondary} />}
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
              <Text style={styles.modalTitle}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <Input
              label="Name"
              placeholder="Customer name"
              value={name}
              onChangeText={setName}
            />
            
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'debtor' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('debtor')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'debtor' && styles.selectedTypeButtonText,
                  ]}
                >
                  Debtor
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'creditor' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('creditor')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'creditor' && styles.selectedTypeButtonText,
                  ]}
                >
                  Creditor
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'neutral' && styles.selectedTypeButton,
                ]}
                onPress={() => setType('neutral')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'neutral' && styles.selectedTypeButtonText,
                  ]}
                >
                  Neutral
                </Text>
              </TouchableOpacity>
            </View>
            
            <Input
              label="Contact Info (Optional)"
              placeholder="Email or phone"
              value={contactInfo}
              onChangeText={setContactInfo}
            />
            
            <Input
              label="Notes (Optional)"
              placeholder="Additional information"
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
  addButton: {
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  customerCard: {
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  customerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  contactInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: Colors.textSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
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
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    color: Colors.text,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#fff',
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