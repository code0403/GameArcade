"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";

const GAMES = [
  { value: "memory", label: "Memory Game" },
  { value: "tictactoe", label: "Tic Tac Toe" },
  { value: "ludo", label: "Ludo" },
  { value: "quiz", label: "Quiz" },
];

export default function InviteModal({ friend }) {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(GAMES[0].value);
  const [status, setStatus] = useState("");

  const handleInvite = () => {
    setStatus("Sending...");
    socket.emit("lobby:invite", { toUserId: friend._id, game }, (res) => {
      if (!res?.ok) {
        setStatus(res?.msg || "Could not send invite");
        return;
      }
      setStatus(res.delivered ? "Invite sent!" : `${friend.username} is offline — they'll see it if they reconnect.`);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setStatus("");
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Invite to Play
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle>Invite {friend.username} to Play</DialogTitle>
        </DialogHeader>

        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="rounded-md border border-slate-600 bg-slate-800 text-white text-sm px-3 py-2"
        >
          {GAMES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        {status && <p className="text-sm text-slate-300">{status}</p>}

        <DialogFooter>
          <Button onClick={handleInvite}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
