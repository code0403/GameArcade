import scoreModel from "../models/scoreModel.js";
import userModel from "../models/userModel.js";

const getTopScores = (game, difficulty, limit = 10) => {
  const query = { game };
  if (difficulty !== undefined) query.difficulty = Number(difficulty);
  return scoreModel.find(query).sort({ time: 1, moves: 1 }).limit(limit).lean();
};

export const submitScore = async (req, res) => {
  try {
    const { game, difficulty, mode = "solo", moves, time, metadata = {} } = req.body;
    if (!game) return res.status(400).json({ msg: "Missing fields" });

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // persist in user's gameStats
    const key = `${game}`; // e.g. memory
    const userStats = user.gameStats.get(key) || { bestTime: null, bestMoves: null, history: [] };

    userStats.history = userStats.history || [];
    userStats.history.unshift({ game, difficulty, mode, moves, time, metadata, date: new Date() });

    // update best metrics
    if (!userStats.bestTime || time < userStats.bestTime) userStats.bestTime = time;
    if (!userStats.bestMoves || moves < userStats.bestMoves) userStats.bestMoves = moves;

    user.gameStats.set(key, userStats);
    await user.save();

    // also save to global Score collection for leaderboards
    const newScore = await scoreModel.create({
      userId: user._id,
      username: user.username,
      game,
      difficulty,
      mode,
      moves,
      time,
      metadata
    });

    if (difficulty !== undefined) {
      const top = await getTopScores(game, difficulty);
      req.app.get("io")?.to(`leaderboard:${game}:${difficulty}`).emit("leaderboard:update", top);
    }

    return res.json({ ok: true, score: newScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getLeaderboards = async (req, res) => {
  try {
    const { game, difficulty, limit = 10 } = req.query;
    if (!game) return res.status(400).json({ msg: "Missing game" });

    const top = await getTopScores(game, difficulty, Number(limit));

    res.json({ top });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ msg: "Not found" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      theme: user.theme,
      gameStats: user.gameStats || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
