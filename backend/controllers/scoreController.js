import scoreModel from "../models/scoreModel.js";
import userModel from "../models/userModel.js";

export const submitScore = async (req, res) => {
  try {
    const { game, difficulty, moves, time } = req.body;
    if (!game || !difficulty) return res.status(400).json({ msg: "Missing fields" });

    const userId = req.user?.id || null;
    let username;

    if (userId) {
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });
      username = user.username;

      // persist in user's gameStats
      const key = `${game}`; // e.g. memory
      const userStats = user.gameStats.get(key) || { bestTime: null, bestMoves: null, history: [] };

      userStats.history = userStats.history || [];
      userStats.history.unshift({ game, difficulty, moves, time, date: new Date() });

      // update best metrics
      if (!userStats.bestTime || time < userStats.bestTime) userStats.bestTime = time;
      if (!userStats.bestMoves || moves < userStats.bestMoves) userStats.bestMoves = moves;

      user.gameStats.set(key, userStats);
      await user.save();
    }

    // also save to global Score collection for leaderboards
    const newScore = await scoreModel.create({
      userId,
      username,
      game,
      difficulty,
      moves,
      time
    });

    return res.json({ ok: true, score: newScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getLeaderboards = async (req, res) => {
  try {
    const { game, difficulty = 4, limit = 10 } = req.query;
    if (!game) return res.status(400).json({ msg: "Missing game" });

    const top = await scoreModel.find({ game, difficulty: Number(difficulty) })
      .sort({ time: 1, moves: 1 })
      .limit(Number(limit))
      .lean();

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
      gameStats: Object.fromEntries(user.gameStats)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
