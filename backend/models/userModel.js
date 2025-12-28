import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  game: { type: String, required: true },        
  difficulty: { type: Number, required: true },   
  moves: Number,
  time: Number,
  date: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // hashed
  theme: { type: String, enum: ["light","dark"], default: "dark" },
  avatarUrl: { type: String, default: "" },

  // aggregated stats per game
  gameStats: {
    type: Map,
    of: new mongoose.Schema({
      bestTime: Number,
      bestMoves: Number,
      history: [ScoreSchema]
    }, { _id: false }),
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
