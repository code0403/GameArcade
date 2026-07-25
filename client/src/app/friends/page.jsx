"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddFriendForm from "@/components/friends/AddFriendForm";
import FriendRequestCard from "@/components/friends/FriendRequestCard";
import FriendList from "@/components/friends/FriendList";
import api from "@/lib/api";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [friendsRes, requestsRes] = await Promise.all([
      api.get("/friends"),
      api.get("/friends/requests"),
    ]);
    setFriends(friendsRes.data.friends);
    setRequests(requestsRes.data.requests);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Friends</h1>

        <Card className="bg-slate-800 text-white border-slate-700">
          <CardHeader>
            <CardTitle>Add a Friend</CardTitle>
          </CardHeader>
          <CardContent>
            <AddFriendForm onRequestSent={refresh} />
          </CardContent>
        </Card>

        {!loading && requests.length > 0 && (
          <Card className="bg-slate-800 text-white border-slate-700">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {requests.map((request) => (
                <FriendRequestCard key={request._id} request={request} onResolved={refresh} />
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 text-white border-slate-700">
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
              <FriendList friends={friends} onChanged={refresh} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
