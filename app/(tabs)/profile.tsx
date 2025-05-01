import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Image,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { LogOut, Shield, Clock, Settings, Camera, Edit } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuthStore();
  const { logs } = useAuditStore();
  
  // Get recent activity logs for this user
  const recentLogs = logs
    .filter(log => log.userId === currentUser?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
            // Redirect to the login screen
            router.replace('/');
          }
        },
      ]
    );
  };
  
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Not logged in</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <View style={styles.roleContainer}>
          <Shield size={14} color={Colors.primary} />
          <Text style={styles.role}>{currentUser.role.toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{currentUser.email}</Text>
        
        <TouchableOpacity style={styles.editProfileButton}>
          <Edit size={16} color={Colors.primary} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue}>{currentUser.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Created:</Text>
          <Text style={styles.infoValue}>
            {new Date(currentUser.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>
      
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      {recentLogs.length > 0 ? (
        <Card>
          {recentLogs.map((log, index) => (
            <View 
              key={log.id} 
              style={[
                styles.activityItem,
                index < recentLogs.length - 1 && styles.activityItemBorder
              ]}
            >
              <View style={styles.activityIconContainer}>
                <Clock size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{log.description}</Text>
                <Text style={styles.activityTime}>
                  {new Date(log.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.noActivityText}>No recent activity</Text>
        </Card>
      )}
      
      {currentUser.role === 'admin' && (
        <>
          <Text style={styles.sectionTitle}>Admin Settings</Text>
          <Card>
            <TouchableOpacity style={styles.settingItem}>
              <Settings size={20} color={Colors.primary} />
              <Text style={styles.settingText}>User Management</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Shield size={20} color={Colors.primary} />
              <Text style={styles.settingText}>Security Settings</Text>
            </TouchableOpacity>
          </Card>
        </>
      )}
      
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
        fullWidth
      />
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  role: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noActivityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 16,
    borderColor: Colors.danger,
  },
  logoutButtonText: {
    color: Colors.danger,
  },
});