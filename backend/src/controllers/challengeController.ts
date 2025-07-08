import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";
import { db } from "../config/db.ts";
import { challenges, challengeParticipants } from "../db/schema.ts";
import { v4 as uuidv4 } from "uuid";
import { and, eq } from "drizzle-orm";

export const createChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!title || !description) {
      res.status(400).json({ error: "Title and description are required" });
      return;
    }
    const challengeId = uuidv4();

    await db.insert(challenges).values({
      id: challengeId,
      title,
      description,
      creatorId: userId!,
    });

    res.status(201).json({ message: "Challenge created", challengeId });
    return;
  } catch (error) {}
};

export const getAllChallenges = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const allChallenges = await db
      .select()
      .from(challenges)
      .orderBy(challenges.createdAt); // ASC first
    // For newest first:
    // .orderBy(desc(challenges.createdAt))
    res.status(200).json({ challenges: allChallenges });
    return;
  } catch (error) {
    console.error("Error fetching all challenges.", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
};

export const joinChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const challengeId = req.params.id;

    if (!challengeId || !userId) {
      res.status(400).json({ error: "Missing challenge ID or User ID" });
      return;
    }

    // Check if already joined
    const existing = await db
      .select()
      .from(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      );

    if (existing.length > 0) {
      res.status(400).json({ error: "Already joined this challenge" });
      return;
    }
    const participantId = uuidv4();
    await db.insert(challengeParticipants).values({
      id: participantId,
      userId,
      challengeId,
    });

    res.status(200).json({ message: "Challenge joined successfully" });
    return;
  } catch (error) {
    console.error("joinChallenge error:", error);
    res.status(500).json({ error: "Failed to join challenge" });
  }
};

export const leaveChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
  } catch (error) {}
};
export const getUserChallenges = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
  } catch (error) {}
};
