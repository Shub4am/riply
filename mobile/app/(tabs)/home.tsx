import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import styles from "@/assets/styles/homeTab.styles";
import COLORS from "@/constants/colors";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import { useChallengeStore } from "@/store/challengeStore";
import { formatPublishDate } from "@/lib/utils";

export default function Home() {
  const { token } = useAuthStore();
  const router = useRouter();

  const {
    challenges,
    joinedChallengeIds,
    page,
    hasMore,
    loading,
    refreshing,
    fetchChallenges,
    fetchJoinedChallenges,
    toggleJoinLeave,
    processingIds,
  } = useChallengeStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchJoinedChallenges(token);
    fetchChallenges(token);
  }, [token]);

  if (!token) {
    return null;
  }

  const handleJoinLeave = async (id: string) => {
    try {
      await toggleJoinLeave(id, token);
    } catch (err) {
      Alert.alert("Error", "Could not update challenge status.");
    }
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchChallenges(token, page + 1);
    }
  };

  if (loading && challenges.length === 0) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              await fetchJoinedChallenges(token);
              await fetchChallenges(token, 1, true);
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>RIPLY</Text>
            <Text style={styles.headerSubtitle}>
              Discover friendly challenges
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="barbell-sharp"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No challenges yet</Text>
            <Text style={styles.emptySubtext}>
              Share a friendly workout challenge
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && challenges.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const hasJoined = joinedChallengeIds.has(item.id);
          return (
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.username}>
                  Posted by {item.creatorName}
                </Text>
              </View>

              <View style={styles.challengeImageContainer}>
                <Image
                  source={item.image}
                  style={styles.challengeImage}
                  contentFit="cover"
                />
              </View>

              <View style={styles.challengeDetails}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.date}>
                  {formatPublishDate(item.createdAt)}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.button,
                  hasJoined && { backgroundColor: COLORS.red },
                ]}
                onPress={() => handleJoinLeave(item.id)}
                disabled={processingIds.has(item.id)}
              >
                <Text style={styles.buttonText}>
                  {hasJoined ? "Leave" : "Join"}
                </Text>
                <Ionicons
                  name={hasJoined ? "close-outline" : "checkmark-done-sharp"}
                  size={30}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}
