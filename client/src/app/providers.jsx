"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { socket } from "@/lib/socket";
import Nav from "@/components/Nav";
import LobbyListener from "@/components/lobby/LobbyListener";

export default function Providers({ children }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Nav />
      {isAuthenticated && <LobbyListener />}
      {children}
    </>
  );
}
