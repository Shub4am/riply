import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/activeTab.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";

export default function LogoutBtn() {
  const { logout } = useAuthStore();
  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };
  return (
    <Pressable style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </Pressable>
  );
}
