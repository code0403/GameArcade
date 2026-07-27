"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import InviteModal from "@/components/lobby/InviteModal";
import api from "@/lib/api";

export default function FriendList({ friends, onChanged }) {
  const handleRemove = async (userId) => {
    await api.delete(`/friends/${userId}`);
    onChanged?.();
  };

  if (friends.length === 0) {
    return <p className="text-slate-400 text-sm">You haven&apos;t added any friends yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {friends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar username={friend.username} avatarUrl={friend.avatarUrl} />
            <span>{friend.username}</span>
          </div>
          <div className="flex gap-2">
            <InviteModal friend={friend} />
            <Button size="sm" variant="secondary" onClick={() => handleRemove(friend._id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
