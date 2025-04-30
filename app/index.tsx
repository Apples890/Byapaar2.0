import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Modal } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email) {
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop' }}
          style={styles.logo}
        />
      </View>
      
      <Text style={styles.title}>Inventory & Budget Tracker</Text>
      <Text style={styles.subtitle}>Manage your inventory, transactions, and budgets in one place</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          onPress={() => setModalVisible(true)}
          style={styles.button}
          fullWidth
        />
      </View>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login</Text>
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <Text style={styles.helpText}>
              For demo: use admin@example.com or employee@example.com
            </Text>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Login"
                onPress={handleLogin}
                style={styles.modalButton}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      <Text style={styles.footer}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 0.48,
  },
});