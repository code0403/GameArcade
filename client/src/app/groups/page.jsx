"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroupList from "@/components/groups/GroupList";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import api from "@/lib/api";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [groupsRes, friendsRes] = await Promise.all([
      api.get("/groups"),
      api.get("/friends"),
    ]);
    setGroups(groupsRes.data.groups);
    setFriends(friendsRes.data.friends);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Groups</h1>
          <CreateGroupModal onCreated={refresh} />
        </div>

        <Card className="bg-slate-800 text-white border-slate-700">
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
              <GroupList groups={groups} friends={friends} onChanged={refresh} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
