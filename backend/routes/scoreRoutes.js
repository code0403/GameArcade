import express from "express";
import { getLeaderboards, getUserProfile, submitScore } from "../controllers/scoreController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitScore);        // save score (auth required)
router.get("/leaderboard", getLeaderboards);               // public leaderboard
router.get("/me", authMiddleware, getUserProfile);        // user profile with gameStats

export default router;
