"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";



export default function DifficultySelector({ selectedDifficulty, setSelectedDifficulty, onStart }) {
  const difficulties = [
    { value: "2", label: "Very Easy", grid: "2×2", pairs: 2 },
    // { value: "3", label: "Easy", grid: "3×3", pairs: 5 },
    { value: "4", label: "Medium", grid: "4×4", pairs: 8 },
    // { value: "5", label: "Hard", grid: "5×5", pairs: 13 },
    { value: "6", label: "Very Hard", grid: "6×6", pairs: 18 },
    // { value: "7", label: "Extreme", grid: "7×7", pairs: 25 },
    { value: "8", label: "Nightmare", grid: "8×8", pairs: 32 },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl text-white max-w-md mx-auto border border-slate-700">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Difficulty</h2>
        <p className="text-sm text-slate-400 mt-1">Choose your challenge level</p>
      </div>

      <RadioGroup
        value={selectedDifficulty}
        onValueChange={setSelectedDifficulty}
        className="grid gap-3"
      >
        {difficulties.map((diff) => (
          <div 
            key={diff.value}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
              selectedDifficulty === diff.value
                ? "bg-blue-600/30 border border-blue-500"
                : "bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700"
            }`}
          >
            <RadioGroupItem value={diff.value} id={`difficulty-${diff.value}`} />
            <Label 
              htmlFor={`difficulty-${diff.value}`}
              className="flex-1 cursor-pointer"
            >
              <div className="font-semibold">{diff.label}</div>
              <div className="text-xs text-slate-300">{diff.grid} Grid • {diff.pairs} Pairs</div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Button
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold py-2 rounded-lg transition-all"
        onClick={onStart}
        disabled={!selectedDifficulty}
      >
        Start Game
      </Button>
    </div>
  );
}
