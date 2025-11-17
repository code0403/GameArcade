"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function WinModal({ open, moves, time, onRestart }) {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-slate-900 text-white border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🎉 You Won!
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            Congratulations! Here are your game stats.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Moves:</span> {moves}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Time:</span> {time}s
          </p>
        </div>

        <DialogFooter>
          <button
            onClick={onRestart}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
          >
            Play Again
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
