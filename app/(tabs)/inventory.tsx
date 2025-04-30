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
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { Item } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/Colors';
import { Plus, Package, Search, X, Edit, Trash } from 'lucide-react-native';

export default function InventoryScreen() {
  const { items, addItem, updateItem, deleteItem } = useInventoryStore();
  const { currentUser } = useAuthStore();
  const { addLog } = useAuditStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const resetForm = () => {
    setName('');
    setSku('');
    setQuantity('');
    setUnitPrice('');
    setDescription('');
    setCategory('');
    setEditingItem(null);
  };
  
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };
  
  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setQuantity(item.quantity.toString());
    setUnitPrice(item.unitPrice.toString());
    setDescription(item.description || '');
    setCategory(item.category);
    setModalVisible(true);
  };
  
  const handleSave = () => {
    if (!name || !sku || !quantity || !unitPrice || !category) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (isNaN(Number(quantity)) || isNaN(Number(unitPrice))) {
      Alert.alert('Error', 'Quantity and price must be numbers');
      return;
    }
    
    if (editingItem) {
      // Update existing item
      updateItem(editingItem.id, {
        name,
        sku,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        description,
        category,
      });
      
      // Add audit log
      addLog({
        userId: currentUser?.id || '',
        action: 'update',
        targetTable: 'items',
        targetId: editingItem.id,
        description: `Updated item: ${name}`,
      });
    } else {
      // Add new item
      const newItemId = addItem({
        name,
        sku,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        description,
        category,
      });
      
      // Add audit log
      addLog({
        userId: currentUser?.id || '',
        action: 'create',
        targetTable: 'items',
        targetId: newItemId,
        description: `Created new item: ${name}`,
      });
    }
    
    setModalVisible(false);
    resetForm();
  };
  
  const handleDelete = (item: Item) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteItem(item.id);
            
            // Add audit log
            addLog({
              userId: currentUser?.id || '',
              action: 'delete',
              targetTable: 'items',
              targetId: item.id,
              description: `Deleted item: ${item.name}`,
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
  
  const renderItem = ({ item }: { item: Item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemActions}>
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
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>SKU:</Text>
          <Text style={styles.detailValue}>{item.sku}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={[
            styles.detailValue, 
            item.quantity < 5 ? styles.lowStock : null
          ]}>
            {item.quantity}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${item.unitPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{item.category}</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <Input
            placeholder="Search items..."
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
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No items found"
            description={
              searchQuery 
                ? "Try adjusting your search" 
                : "Add your first inventory item to get started"
            }
            buttonTitle={searchQuery ? undefined : "Add Item"}
            onButtonPress={searchQuery ? undefined : openAddModal}
            icon={<Package size={48} color={Colors.textSecondary} />}
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
                {editingItem ? 'Edit Item' : 'Add New Item'}
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
              placeholder="Item name"
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label="SKU"
              placeholder="Stock keeping unit"
              value={sku}
              onChangeText={setSku}
            />
            
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
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
            </View>
            
            <Input
              label="Category"
              placeholder="Item category"
              value={category}
              onChangeText={setCategory}
            />
            
            <Input
              label="Description (Optional)"
              placeholder="Item description"
              value={description}
              onChangeText={setDescription}
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
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  itemDetails: {
    marginBottom: 12,
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
  lowStock: {
    color: Colors.warning,
  },
  description: {
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