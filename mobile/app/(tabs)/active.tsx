import { View, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/activeTab.styles";
import ProfileHeader from "@/components/ProfileHeader";
import LogoutBtn from "@/components/LogoutBtn";

export default function Active() {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const fetchUserChallenges = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/challenges/mine`, {
        headers: { Authorization: `Bearer: ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch active challenges");

      setChallenges(data);

      //
    } catch (error) {
      console.error("Error fetching challenges: ", error);
      Alert.alert("Error", "Failed to load active challenges.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChallenges();
  }, []);

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutBtn />
      <View style={styles.challengesHeader}>
        <Text style={styles.challengeTitle}>Your active challenges</Text>
        <Text style={styles.challengesCount}>
          {challenges.length} challenges
        </Text>
      </View>
    </View>
  );
}
