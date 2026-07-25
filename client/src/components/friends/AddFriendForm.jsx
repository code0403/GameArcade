"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import api from "@/lib/api";

export default function AddFriendForm({ onRequestSent }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sentTo, setSentTo] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!query.trim()) return;
    try {
      const { data } = await api.get("/friends/search", { params: { q: query.trim() } });
      setResults(data.users);
    } catch {
      setError("Search failed");
    }
  };

  const handleAdd = async (userId) => {
    try {
      await api.post(`/friends/request/${userId}`);
      setSentTo((prev) => [...prev, userId]);
      onRequestSent?.();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not send request");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar username={user.username} avatarUrl={user.avatarUrl} />
                <span>{user.username}</span>
              </div>
              <Button
                size="sm"
                disabled={sentTo.includes(user._id)}
                onClick={() => handleAdd(user._id)}
              >
                {sentTo.includes(user._id) ? "Sent" : "Add Friend"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
