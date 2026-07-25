"use client";

import { use } from "react";
import LobbyRoom from "@/components/lobby/LobbyRoom";

export default function LobbyPage({ params }) {
  const { roomId } = use(params);

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <LobbyRoom roomId={roomId} />
    </main>
  );
}
