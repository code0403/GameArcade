"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

function AddMemberRow({ group, friends, onChanged }) {
  const memberIds = new Set(group.members.map((m) => m._id));
  const addableFriends = friends.filter((f) => !memberIds.has(f._id));
  const [selected, setSelected] = useState("");

  if (addableFriends.length === 0) return null;

  const handleAdd = async () => {
    if (!selected) return;
    await api.post(`/groups/${group._id}/members`, { userId: selected });
    setSelected("");
    onChanged?.();
  };

  return (
    <div className="flex gap-2 mt-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="flex-1 rounded-md border border-slate-600 bg-slate-800 text-white text-sm px-2 py-1"
      >
        <option value="">Add a friend...</option>
        {addableFriends.map((f) => (
          <option key={f._id} value={f._id}>
            {f.username}
          </option>
        ))}
      </select>
      <Button size="sm" disabled={!selected} onClick={handleAdd}>
        Add
      </Button>
    </div>
  );
}

export default function GroupList({ groups, friends, onChanged }) {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const handleDelete = async (groupId) => {
    await api.delete(`/groups/${groupId}`);
    onChanged?.();
  };

  const handleLeave = async (groupId) => {
    await api.delete(`/groups/${groupId}/members/${currentUserId}`);
    onChanged?.();
  };

  if (groups.length === 0) {
    return <p className="text-slate-400 text-sm">You&apos;re not in any groups yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const isOwner = group.owner._id === currentUserId;
        return (
          <div key={group._id} className="bg-slate-700 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{group.name}</p>
                <p className="text-xs text-slate-400">Owner: {group.owner.username}</p>
              </div>
              {isOwner ? (
                <Button size="sm" variant="secondary" onClick={() => handleDelete(group._id)}>
                  Delete
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => handleLeave(group._id)}>
                  Leave
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {group.members.map((member) => (
                <div key={member._id} className="flex items-center gap-1 bg-slate-800 rounded-full pl-1 pr-3 py-1">
                  <Avatar username={member.username} avatarUrl={member.avatarUrl} className="size-6 text-xs" />
                  <span className="text-xs">{member.username}</span>
                </div>
              ))}
            </div>

            {isOwner && <AddMemberRow group={group} friends={friends} onChanged={onChanged} />}
          </div>
        );
      })}
    </div>
  );
}
