import { useEffect, useState } from "react";
import { View, Text, FlatList, ListRenderItem } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";

import styles from "@/assets/styles/homeTab.styles";
import { API_URL } from "@/constants/api";

interface Challenge {
  id: string;
  image: string;
  creatorName: string;
}

export default function Home() {
  const { token } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      console.log("🔍 Response status:", response.status);

      const data = await response.json();
      console.log("📦 Data received:", data);

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch challenges");

      setChallenges((prev) => [...prev, ...data.challenges]);
      setHasMore(pageNo < data.totalPages);
      setPage(pageNo);
    } catch (error) {
      console.log("Error fetching challenges", error);
    } finally {
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchChallenges(page + 1);
    }
  };

  const renderChallenges: ListRenderItem<Challenge> = ({ item }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>Hello {item.creatorName}</Text>
        </View>
      </View>
      <View style={styles.challengeImageContainer}>
        <Image
          source={item.image}
          style={styles.challengeImage}
          contentFit="cover"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList<Challenge>
        data={challenges}
        renderItem={renderChallenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
