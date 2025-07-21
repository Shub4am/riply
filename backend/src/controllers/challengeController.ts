import type { Response } from "express";
import { db } from "../config/db.ts";
import { and, desc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";
import { challenges, challengeParticipants, users } from "../db/schema.ts";
import cloudinary from "../config/cloudinary.ts";

export const createChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, description, image } = req.body;
    const userId = req.user?.id;

    if (!title || !description || !image) {
      res
        .status(400)
        .json({ message: "Title, description, and image are required" });
      return;
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const challengeId = uuidv4();

    await db.insert(challenges).values({
      id: challengeId,
      image: imageUrl,
      title,
      description,
      creatorId: userId!,
    });

    res.status(201).json({ message: "Challenge created", challengeId });
    return;
  } catch (error) {
    console.error("createChallenge error:", error);
    res.status(500).json({ message: "Failed to create challenges" });
  }
};

export const getAllChallenges = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;

    const allChallenges = await db
      .select({
        id: challenges.id,
        image: challenges.image,
        title: challenges.title,
        description: challenges.description,
        creatorId: challenges.creatorId,
        createdAt: challenges.createdAt,
        creatorName: users.name,
      })
      .from(challenges)
      .innerJoin(users, eq(challenges.creatorId, users.id))
      .orderBy(desc(challenges.createdAt))
      .limit(limit)
      .offset(offset);

    console.log("allChallenges:");

    // Get total count
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(challenges);
    const totalChallenges = total[0]?.count ?? 0;
    console.log("allChallenges result:", allChallenges);

    res.status(200).json({
      challenges: allChallenges,
      currentPage: page,
      totalChallenges,
      totalPages: Math.ceil(totalChallenges / limit),
    });
  } catch (error) {
    console.error("Error fetching paginated challenges:", error);
    res.status(500).json({ message: "Failed to fetch challenges" });
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
      res.status(400).json({ message: "Missing challenge ID or User ID" });
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
      res.status(400).json({ message: "Already joined this challenge" });
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
    res.status(500).json({ message: "Failed to join challenge" });
  }
};

export const leaveChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const challengeId = req.params.id;

    if (!userId || !challengeId) {
      res.status(400).json({ message: "Missinf user or challenge ID" });
      return;
    }

    const deleted = await db
      .delete(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.userId, userId),
          eq(challengeParticipants.challengeId, challengeId)
        )
      );

    if (deleted.rowCount === 0) {
      res.status(404).json({ message: "Not part of this challenge" });
      return;
    }
    res.status(200).json({ message: "Left challenge successfully" });
    return;
  } catch (error) {
    console.error("leaveChallenge error:", error);
    res.status(500).json({ message: "Failed to leave challenge" });
  }
};

export const getUserChallenges = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const joined = await db
      .select({
        challengeId: challengeParticipants.challengeId,
        challenge: challenges,
      })
      .from(challengeParticipants)
      .innerJoin(
        challenges,
        eq(challengeParticipants.challengeId, challenges.id)
      )
      .where(eq(challengeParticipants.userId, userId));

    const userChallenges = joined.map((entry) => entry.challenge);

    res.status(200).json({ challenges: userChallenges });
    return;
  } catch (error) {
    console.error("getUserChallenges error:", error);
    res.status(500).json({ message: "Failed to fetch user challenges" });
  }
};
