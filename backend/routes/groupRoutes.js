import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createGroup,
  listMyGroups,
  addMember,
  removeMember,
  deleteGroup
} from "../controllers/groupController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createGroup);
router.get("/", listMyGroups);
router.post("/:groupId/members", addMember);
router.delete("/:groupId/members/:userId", removeMember);
router.delete("/:groupId", deleteGroup);

export default router;
