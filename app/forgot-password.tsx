import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Colors from '@/constants/Colors';
import { ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  const handleResetPassword = () => {
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 1500);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Reset Password',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {!emailSent ? (
          <View style={styles.content}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
              containerStyle={styles.inputContainer}
            />
            
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
              fullWidth
            />
            
            <TouchableOpacity 
              onPress={() => router.replace('/')}
              style={styles.backToLoginButton}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instructionText}>
              Please check your email and follow the instructions to reset your password.
            </Text>
            
            <Button
              title="Back to Login"
              onPress={() => router.replace('/')}
              style={styles.backButton}
              fullWidth
            />
            
            <TouchableOpacity 
              onPress={() => setEmailSent(false)}
              style={styles.resendLink}
            >
              <Text style={styles.resendText}>Didn't receive the email? Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    marginTop: 24,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 24,
  },
  backToLoginButton: {
    alignSelf: 'center',
  },
  backToLoginText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  resendLink: {
    marginTop: 24,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
  },
});