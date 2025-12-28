import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  username: String,
  game: { type: String, required: true },
  difficulty: { type: Number, required: true },
  moves: Number,
  time: Number,
  date: { type: Date, default: Date.now }
});

ScoreSchema.index({ game: 1, difficulty: 1, time: 1, moves: 1 }); // helps leaderboard queries

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
