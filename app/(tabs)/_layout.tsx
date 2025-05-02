import React from "react";
import { router, Stack, Tabs } from "expo-router";
import { Platform, TouchableOpacity } from "react-native";
import { Home, Package, Users, FileText, BarChart3, User } from "lucide-react-native";
import Colors from "@/constants/Colors";

export default function TabLayout() {
  return (
          <>
          <Stack.Screen options={{ headerShown: false }} /><Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={{ marginRight: 16 }}
          >
            <User size={24} color={Colors.primary} />
          </TouchableOpacity>),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }} />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }} />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }} />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }} />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }} />
    </Tabs></>
  );
}