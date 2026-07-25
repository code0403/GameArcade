"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";

export default function LobbyListener() {
  const router = useRouter();
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    const handleInvite = (payload) => setInvite(payload);
    const handleAccepted = ({ roomId }) => {
      setInvite(null);
      router.push(`/lobby/${roomId}`);
    };

    socket.on("lobby:invite", handleInvite);
    socket.on("lobby:accepted", handleAccepted);

    return () => {
      socket.off("lobby:invite", handleInvite);
      socket.off("lobby:accepted", handleAccepted);
    };
  }, [router]);

  if (!invite) return null;

  const respond = (action) => {
    if (action === "accept") {
      socket.emit("lobby:accept", { inviteId: invite.inviteId }, (res) => {
        if (res?.ok) router.push(`/lobby/${res.roomId}`);
      });
    } else {
      socket.emit("lobby:decline", { inviteId: invite.inviteId });
    }
    setInvite(null);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setInvite(null)}>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle>Game Invite</DialogTitle>
        </DialogHeader>
        <p>
          <span className="font-semibold">{invite.fromUser.username}</span> invited you to play{" "}
          <span className="font-semibold capitalize">{invite.game}</span>.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={() => respond("decline")}>
            Decline
          </Button>
          <Button onClick={() => respond("accept")}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
