import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";

import { formatPublishDate } from "@/lib/utils";
import { API_URL } from "@/constants/api";
import styles from "@/assets/styles/homeTab.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import Loader from "@/components/Loader";

interface Challenge {
  id: string;
  image: string;
  creatorName: string;
  title: string;
  description: string;
  createdAt: string;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { token } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<string>>(
    new Set()
  );
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchChallenges = async (pageNo = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNo === 1) setLoading(true);

      const response = await fetch(
        `${API_URL}/api/challenges?page=${pageNo}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch challenges");

      setChallenges((prev) => {
        const merged =
          refresh || pageNo === 1
            ? data.challenges
            : [...prev, ...data.challenges];

        const challengeMap = new Map<string, Challenge>();
        for (const i of merged) {
          challengeMap.set(i.id, i);
        }
        return Array.from(challengeMap.values());
      });

      setHasMore(pageNo < data.totalPages);
      setPage(pageNo);
    } catch (error) {
      console.log("Error fetching challenges", error);
    } finally {
      if (refresh) {
        await sleep(800);
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  const fetchJoinedChallenges = async () => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error fetching joined challenges:");
      }
      if (!Array.isArray(data.challenges)) {
        console.error("Unexpected response format:", data);
        return;
      }

      const joinedIds = new Set<string>(
        data.challenges.map((challenge: Challenge) => challenge.id)
      );
      setJoinedChallengeIds(joinedIds);
    } catch (error) {
      console.log("Join/Leave error", error);
    }
  };

  useEffect(() => {
    fetchJoinedChallenges();
    fetchChallenges();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchChallenges(page + 1);
    }
  };

  const handleJoinLeaveChallenge = async (challengeId: string) => {
    const hasJoined = joinedChallengeIds.has(challengeId);
    // Add loading state to prevent spam clicks
    if (processingIds.has(challengeId)) return;
    setProcessingIds((prev) => new Set(prev).add(challengeId));

    try {
      const res = await fetch(
        `${API_URL}/api/challenges/${challengeId}/${
          hasJoined ? "leave" : "join"
        }`,
        {
          method: hasJoined ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.message || "Something went wrong");
        return;
      }

      // Only update state after successful API response
      setJoinedChallengeIds((prev) => {
        const updated = new Set(prev);
        if (hasJoined) {
          updated.delete(challengeId);
        } else {
          updated.add(challengeId);
        }
        return updated;
      });
    } catch (error) {
      console.log("Join/Leave error", error);
      Alert.alert("Network error. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(challengeId);
        return updated;
      });
    }
  };

  const renderChallenges: ListRenderItem<Challenge> = ({ item }) => {
    const hasJoined = joinedChallengeIds.has(item.id);
    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>Posted by {item.creatorName}</Text>
          </View>
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
          <Text style={styles.date}>{formatPublishDate(item.createdAt)}</Text>
        </View>

        <Pressable
          style={[styles.button, hasJoined && { backgroundColor: COLORS.red }]}
          onPress={() => handleJoinLeaveChallenge(item.id)}
        >
          <Text style={styles.buttonText}>{hasJoined ? "Leave" : "Join"}</Text>
          <Ionicons
            name={hasJoined ? "close-outline" : "checkmark-done-sharp"}
            size={30}
            color={COLORS.white}
          />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList<Challenge>
        data={challenges}
        renderItem={renderChallenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              await fetchJoinedChallenges();
              await fetchChallenges(1, true);
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>RIPLY</Text>
            <Text style={styles.headerSubtitle}>
              Discover friendly workout challenges
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
      />
    </View>
  );
}
