"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function FriendRequestCard({ request, onResolved }) {
  const respond = async (action) => {
    await api.post(`/friends/${action}/${request._id}`);
    onResolved?.();
  };

  return (
    <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar username={request.from.username} avatarUrl={request.from.avatarUrl} />
        <span>{request.from.username}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => respond("accept")}>
          Accept
        </Button>
        <Button size="sm" variant="secondary" onClick={() => respond("decline")}>
          Decline
        </Button>
      </div>
    </div>
  );
}
