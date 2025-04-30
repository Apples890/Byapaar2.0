import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'success':
        return styles.successBadge;
      case 'warning':
        return styles.warningBadge;
      case 'danger':
        return styles.dangerBadge;
      case 'info':
        return styles.infoBadge;
      case 'neutral':
        return styles.neutralBadge;
      default:
        return styles.neutralBadge;
    }
  };

  const getTextStyle = () => {
    switch (status) {
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      case 'info':
        return styles.infoText;
      case 'neutral':
        return styles.neutralText;
      default:
        return styles.neutralText;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  successBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  warningBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  dangerBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  infoBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  neutralBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  successText: {
    color: Colors.success,
  },
  warningText: {
    color: Colors.warning,
  },
  dangerText: {
    color: Colors.danger,
  },
  infoText: {
    color: Colors.primary,
  },
  neutralText: {
    color: Colors.textSecondary,
  },
});