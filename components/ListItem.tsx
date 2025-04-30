import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  showChevron?: boolean;
}

export default function ListItem({
  title,
  subtitle,
  rightContent,
  onPress,
  style,
  showChevron = true,
}: ListItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>
      
      <View style={styles.rightContainer}>
        {rightContent}
        {onPress && showChevron && (
          <ChevronRight size={20} color={Colors.textSecondary} />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});