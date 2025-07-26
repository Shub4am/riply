import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/activeTab.styles";
import { formatMemberSince } from "@/lib/utils";

export default function ProfileHeader() {
  const { user } = useAuthStore();
  const generateColor = (str: string | undefined) => {
    let hash = 0;
    if (!str) return `hsl(0, 65%, 55%)`;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };
  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name.split(" ").join("").toUpperCase().slice(0, 2);
  };

  const avatarColor = generateColor(user?.name);
  const initials = getInitials(user?.name);

  return (
    <View style={styles.profileHeader}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
    </View>
  );
}
