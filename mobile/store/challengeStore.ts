// /store/challengeStore.ts

import { create } from "zustand";
import { API_URL } from "@/constants/api";

interface Challenge {
  id: string;
  image: string;
  creatorName: string;
  title: string;
  description: string;
  createdAt: string;
}

interface ChallengeStore {
  challenges: Challenge[];
  joinedChallenges: Challenge[];
  joinedChallengeIds: Set<string>;
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  processingIds: Set<string>;

  fetchChallenges: (
    token: string,
    pageNo?: number,
    refresh?: boolean
  ) => Promise<void>;
  fetchJoinedChallenges: (token: string) => Promise<void>;
  toggleJoinLeave: (challengeId: string, token: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  joinedChallenges: [],
  joinedChallengeIds: new Set(),
  page: 1,
  hasMore: true,
  loading: false,
  refreshing: false,
  processingIds: new Set(),

  fetchChallenges: async (token, pageNo = 1, refresh = false) => {
    try {
      if (refresh) set({ refreshing: true });
      else if (pageNo === 1) set({ loading: true });

      const res = await fetch(
        `${API_URL}/api/challenges?page=${pageNo}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch challenges");

      const existing = get().challenges;
      const merged =
        refresh || pageNo === 1
          ? data.challenges
          : [...existing, ...data.challenges];

      const challengeMap = new Map<string, Challenge>();
      for (const c of merged) challengeMap.set(c.id, c);

      set({
        challenges: Array.from(challengeMap.values()),
        hasMore: pageNo < data.totalPages,
        page: pageNo,
      });
    } catch (e) {
      console.error("fetchChallenges error", e);
    } finally {
      set({ loading: false, refreshing: false });
    }
  },

  fetchJoinedChallenges: async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/challenges/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch joined challenges");

      const ids = new Set<string>(data.challenges.map((c: Challenge) => c.id));
      set({ joinedChallengeIds: ids, joinedChallenges: data.challenges });
    } catch (e) {
      console.error("fetchJoinedChallenges error", e);
    }
  },

  toggleJoinLeave: async (challengeId, token) => {
    const { joinedChallengeIds, processingIds, challenges, joinedChallenges } =
      get();
    const hasJoined = joinedChallengeIds.has(challengeId);
    if (processingIds.has(challengeId)) return;

    set({ processingIds: new Set(processingIds).add(challengeId) });

    try {
      const res = await fetch(
        `${API_URL}/api/challenges/${challengeId}/${
          hasJoined ? "leave" : "join"
        }`,
        {
          method: hasJoined ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update join/leave status");

      const updatedIds = new Set(joinedChallengeIds);
      let updatedChallenges = [...joinedChallenges];

      if (hasJoined) {
        updatedIds.delete(challengeId);
        updatedChallenges = joinedChallenges.filter(
          (c) => c.id !== challengeId
        );
      } else {
        updatedIds.add(challengeId);
        const found = challenges.find((c) => c.id === challengeId);
        if (found) {
          updatedChallenges = [...joinedChallenges, found];
        }
      }

      set({
        joinedChallengeIds: updatedIds,
        joinedChallenges: updatedChallenges,
      });
    } catch (e) {
      console.error("toggleJoinLeave error", e);
    } finally {
      const updated = new Set(get().processingIds);
      updated.delete(challengeId);
      set({ processingIds: updated });
    }
  },
}));
