"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import Nav from "@/components/Nav";

export default function Providers({ children }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
