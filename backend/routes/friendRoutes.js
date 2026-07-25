import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  listFriends,
  listIncomingRequests,
  removeFriend
} from "../controllers/friendController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/search", searchUsers);
router.get("/", listFriends);
router.get("/requests", listIncomingRequests);
router.post("/request/:userId", sendFriendRequest);
router.post("/accept/:requestId", acceptFriendRequest);
router.post("/decline/:requestId", declineFriendRequest);
router.delete("/:userId", removeFriend);

export default router;
