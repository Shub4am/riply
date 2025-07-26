import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/constants/api";
import ProfileHeader from "@/components/ProfileHeader";
import LogoutBtn from "@/components/LogoutBtn";
import Loader from "@/components/Loader";
import { sleep } from "./home";

import COLORS from "@/constants/colors";
import styles from "@/assets/styles/activeTab.styles";

interface Challenge {
  id: string;
  image: string;
  creatorName: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function Active() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteChallengeId, setDeleteChallengeId] = useState<string | null>(
    null
  );

  const router = useRouter();
  const { token } = useAuthStore();

  const fetchUserChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/challenges/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        console.log("Failed response:", data);
        throw new Error(data.message || "Failed to fetch active challenges");
      }

      setChallenges(data.challenges);
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

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      setDeleteChallengeId(challengeId);
      const response = await fetch(
        `${API_URL}/api/challenges/${challengeId}/leave`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to leave challenge");

      setChallenges(challenges.filter((idx) => idx.id !== challengeId));
      Alert.alert("Success", "Challenge left successfully");
    } catch (error) {
      console.log("Leave error", error);
      Alert.alert("Network error. Please try again.");
    } finally {
      setDeleteChallengeId(null);
    }
  };

  const confirmLeave = (challengeId: string) => {
    Alert.alert(
      "Leave challenge",
      "Are you sure you want to leave this challenge?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => handleLeaveChallenge(challengeId),
        },
      ]
    );
  };

  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeItem}>
      <Image source={item.image} style={styles.challengeImage} />
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.challengeDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={() => confirmLeave(item.id)}
      >
        {deleteChallengeId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-bin" size={20} color={COLORS.primary} />
        )}
      </Pressable>
    </View>
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await sleep(800);
    await fetchUserChallenges();
    setIsRefreshing(false);
  };

  if (isLoading && !isRefreshing) return <Loader />;

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

      <FlatList<Challenge>
        data={challenges}
        renderItem={renderChallengeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.challengesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="barbell-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No challenges yet</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/home")}
            >
              <Text style={styles.addButtonText}>Add your first challenge</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
