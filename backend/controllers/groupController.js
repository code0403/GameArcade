import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "Missing group name" });

    const group = await groupModel.create({
      name,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const listMyGroups = async (req, res) => {
  try {
    const groups = await groupModel
      .find({ members: req.user.id })
      .populate("members", "username avatarUrl")
      .populate("owner", "username")
      .lean();

    res.json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ msg: "Missing userId" });

    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });
    if (String(group.owner) !== req.user.id) return res.status(403).json({ msg: "Only the owner can add members" });

    const me = await userModel.findById(req.user.id);
    if (!me.friends.some((id) => String(id) === userId)) {
      return res.status(400).json({ msg: "You can only add your friends to a group" });
    }

    await groupModel.findByIdAndUpdate(groupId, { $addToSet: { members: userId } });
    res.json({ msg: "Member added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const isOwner = String(group.owner) === req.user.id;
    const isSelf = userId === req.user.id;
    if (!isOwner && !isSelf) return res.status(403).json({ msg: "Not authorized" });
    if (userId === String(group.owner)) return res.status(400).json({ msg: "Owner cannot be removed" });

    await groupModel.findByIdAndUpdate(groupId, { $pull: { members: userId } });
    res.json({ msg: "Member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });
    if (String(group.owner) !== req.user.id) return res.status(403).json({ msg: "Only the owner can delete the group" });

    await groupModel.findByIdAndDelete(groupId);
    res.json({ msg: "Group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
