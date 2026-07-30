import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function QuestionCard({
  question,
  options,
  category,
  difficulty,
  index,
  total,
  timeLeft,
  selectedChoice,
  correctIndex,
  onSelect,
}) {
  const revealed = correctIndex !== null && correctIndex !== undefined;

  return (
    <div className="flex flex-col gap-4 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>
          Question {index + 1} / {total}
        </span>
        <div className="flex gap-2 items-center">
          <Badge className="capitalize">{category}</Badge>
          <Badge variant="secondary" className="capitalize">{difficulty}</Badge>
          <span className="font-semibold text-white">{timeLeft}s</span>
        </div>
      </div>

      <p className="text-lg font-semibold">{question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, i) => {
          const isSelected = selectedChoice === i;
          const isCorrect = revealed && i === correctIndex;
          const isWrongSelected = revealed && isSelected && i !== correctIndex;

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={revealed || selectedChoice !== null && selectedChoice !== undefined}
              className={cn(
                "text-left px-4 py-3 rounded-lg border transition-colors disabled:cursor-not-allowed",
                isCorrect && "bg-green-700 border-green-500",
                isWrongSelected && "bg-red-700 border-red-500",
                !revealed && isSelected && "bg-blue-700 border-blue-500",
                !revealed && !isSelected && "bg-slate-700 border-slate-600 hover:bg-slate-600"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
