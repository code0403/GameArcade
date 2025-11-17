"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function SocketTest() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <p>Socket test running…</p>;
}
