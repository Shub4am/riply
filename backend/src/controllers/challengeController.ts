import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";
import { db } from "../config/db.ts";
import { challenges } from "../db/schema.ts";
import { v4 as uuidv4 } from "uuid";

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
  } catch (error) {}
};

export const joinChallenge = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
  } catch (error) {}
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
