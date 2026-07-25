"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";

export default function Nav() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrating, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="w-full flex justify-between items-center bg-gray-950 text-white px-6 py-3 border-b border-gray-800">
      <Link href="/" className="font-bold text-lg">
        Game Arcade
      </Link>

      <div className="flex items-center gap-4">
        {isHydrating ? null : isAuthenticated ? (
          <>
            <Link href="/friends" className="text-sm text-gray-300 hover:text-white">
              Friends
            </Link>
            <Link href="/groups" className="text-sm text-gray-300 hover:text-white">
              Groups
            </Link>
            <span className="text-sm text-gray-300">{user?.username}</span>
            <Button
              size="sm"
              onClick={handleLogout}
              className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
            >
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-gray-300 hover:text-white">
              Log In
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
