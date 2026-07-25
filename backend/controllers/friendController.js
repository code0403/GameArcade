import userModel from "../models/userModel.js";
import friendRequestModel from "../models/friendRequestModel.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await userModel
      .find({ username: { $regex: q, $options: "i" }, _id: { $ne: req.user.id } })
      .select("username avatarUrl")
      .limit(10)
      .lean();

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ msg: "Cannot friend yourself" });

    const targetUser = await userModel.findById(userId);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    const me = await userModel.findById(req.user.id);
    if (me.friends.some((id) => String(id) === userId)) {
      return res.status(409).json({ msg: "Already friends" });
    }

    // if they already sent us a pending request, accept it instead of creating a duplicate
    const reverse = await friendRequestModel.findOne({ from: userId, to: req.user.id, status: "pending" });
    if (reverse) {
      reverse.status = "accepted";
      await reverse.save();
      await userModel.findByIdAndUpdate(req.user.id, { $addToSet: { friends: userId } });
      await userModel.findByIdAndUpdate(userId, { $addToSet: { friends: req.user.id } });
      return res.json({ msg: "Friend request accepted", status: "accepted" });
    }

    const request = await friendRequestModel.findOneAndUpdate(
      { from: req.user.id, to: userId },
      { status: "pending" },
      { upsert: true, new: true }
    );

    res.json({ request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await friendRequestModel.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (String(request.to) !== req.user.id) return res.status(403).json({ msg: "Not authorized" });
    if (request.status !== "pending") return res.status(400).json({ msg: "Request already resolved" });

    request.status = "accepted";
    await request.save();

    await userModel.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    await userModel.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

    res.json({ msg: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await friendRequestModel.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (String(request.to) !== req.user.id) return res.status(403).json({ msg: "Not authorized" });
    if (request.status !== "pending") return res.status(400).json({ msg: "Request already resolved" });

    request.status = "declined";
    await request.save();

    res.json({ msg: "Friend request declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const listFriends = async (req, res) => {
  try {
    const me = await userModel.findById(req.user.id).populate("friends", "username avatarUrl").lean();
    res.json({ friends: me.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const listIncomingRequests = async (req, res) => {
  try {
    const requests = await friendRequestModel
      .find({ to: req.user.id, status: "pending" })
      .populate("from", "username avatarUrl")
      .lean();
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    await userModel.findByIdAndUpdate(req.user.id, { $pull: { friends: userId } });
    await userModel.findByIdAndUpdate(userId, { $pull: { friends: req.user.id } });
    await friendRequestModel.deleteMany({
      $or: [
        { from: req.user.id, to: userId },
        { from: userId, to: req.user.id }
      ]
    });
    res.json({ msg: "Friend removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
