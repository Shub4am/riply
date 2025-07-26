import express from "express";
import {
  createChallenge,
  getAllChallenges,
  joinChallenge,
  leaveChallenge,
  getUserChallenges,
} from "../controllers/challengeController.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/", requireAuth, createChallenge);
router.get("/", requireAuth, getAllChallenges);
router.post("/:id/join", requireAuth, joinChallenge);
router.delete("/:id/leave", requireAuth, leaveChallenge);
router.get("/mine", requireAuth, getUserChallenges);

export default router;
