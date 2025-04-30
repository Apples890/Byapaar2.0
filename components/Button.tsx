import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = styles.primaryButton;
        break;
      case 'secondary':
        buttonStyle = styles.secondaryButton;
        break;
      case 'outline':
        buttonStyle = styles.outlineButton;
        break;
      case 'danger':
        buttonStyle = styles.dangerButton;
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, ...styles.smallButton };
        break;
      case 'medium':
        buttonStyle = { ...buttonStyle, ...styles.mediumButton };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, ...styles.largeButton };
        break;
    }
    
    // Disabled style
    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.disabledButton };
    }
    
    // Full width style
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, ...styles.fullWidthButton };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleVar: TextStyle = {};
    
    switch (variant) {
      case 'primary':
        textStyleVar = styles.primaryText;
        break;
      case 'secondary':
        textStyleVar = styles.secondaryText;
        break;
      case 'outline':
        textStyleVar = styles.outlineText;
        break;
      case 'danger':
        textStyleVar = styles.dangerText;
        break;
    }
    
    switch (size) {
      case 'small':
        textStyleVar = { ...textStyleVar, ...styles.smallText };
        break;
      case 'medium':
        textStyleVar = { ...textStyleVar, ...styles.mediumText };
        break;
      case 'large':
        textStyleVar = { ...textStyleVar, ...styles.largeText };
        break;
    }
    
    if (disabled) {
      textStyleVar = { ...textStyleVar, ...styles.disabledText };
    }
    
    return textStyleVar;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? Colors.primary : '#fff'} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Size styles
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  
  // Text styles
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dangerText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Text size styles
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
  
  // Full width style
  fullWidthButton: {
    width: '100%',
  },
});