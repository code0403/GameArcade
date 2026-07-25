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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function CreateGroupModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/groups", { name });
      setName("");
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="w-full">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
