import React, { useEffect, useMemo, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/store/authStore";
import { useChallengeStore } from "@/store/challengeStore";
import ProfileHeader from "@/components/ProfileHeader";
import LogoutBtn from "@/components/LogoutBtn";
import Loader from "@/components/Loader";
import COLORS from "@/constants/colors";
import styles from "@/assets/styles/activeTab.styles";

export default function Active() {
  const router = useRouter();
  const { token } = useAuthStore();

  const {
    challenges,
    joinedChallengeIds,
    fetchJoinedChallenges,
    toggleJoinLeave,
    processingIds,
  } = useChallengeStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const activeChallenges = useMemo(
    () => challenges.filter((c) => joinedChallengeIds.has(c.id)),
    [challenges, joinedChallengeIds]
  );

  useEffect(() => {
    const load = async () => {
      if (!token) {
        router.replace("/login");
        return;
      }
      setIsLoading(true);
      if (token) {
        await fetchJoinedChallenges(token);
      }
      setIsLoading(false);
    };
    load();
  }, [token]);

  if (!token) {
    return null;
  }

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      setLeavingId(challengeId);
      await toggleJoinLeave(challengeId, token);
      Alert.alert("Success", "Challenge left successfully");
    } catch (error) {
      console.error("Leave error", error);
      Alert.alert("Error", "Failed to leave challenge");
    } finally {
      setLeavingId(null);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchJoinedChallenges(token);
    setIsRefreshing(false);
  };

  const renderChallengeItem = ({ item }: { item: (typeof challenges)[0] }) => (
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
        disabled={processingIds.has(item.id)}
      >
        {leavingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-bin" size={20} color={COLORS.primary} />
        )}
      </Pressable>
    </View>
  );

  if (isLoading && !isRefreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutBtn />

      <View style={styles.challengesHeader}>
        <Text style={styles.challengeTitle}>Your active challenges</Text>
        <Text style={styles.challengesCount}>
          {activeChallenges.length} challenge
          {activeChallenges.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={activeChallenges}
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
