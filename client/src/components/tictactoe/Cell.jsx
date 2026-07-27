export default function Cell({ value, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className="aspect-square bg-slate-800 border border-slate-700 rounded-lg text-4xl font-bold flex items-center justify-center disabled:cursor-not-allowed hover:enabled:bg-slate-700 transition-colors"
    >
      {value === "X" && <span className="text-blue-400">X</span>}
      {value === "O" && <span className="text-red-400">O</span>}
    </button>
  );
}
