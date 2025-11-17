"use client";

export default function Card({ card, onClick }) {
    
  
  const flippedClass = card.flipped || card.matched ? 'transform-[rotateY(180deg)]' : 'transform-[rotateY(0deg)]';

  return (
    <div
      className="aspect-square cursor-pointer select-none group"
      onClick={() => onClick(card)}
    >
      <div className={`w-full h-full ${flippedClass} duration-500 relative transform-3d perspective-[1000px]`}>
        {/* Back side (visible by default) */}
        <div className="absolute inset-0 flex items-center justify-center text-5xl rounded-2xl bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 text-white backface-hidden shadow-2xl border border-slate-600/50 transition-all group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] group-hover:border-slate-500">
          ?
        </div>

        {/* Front side (rotated; becomes visible after container rotates) */}
        <div className="absolute inset-0 flex items-center justify-center text-6xl rounded-2xl bg-linear-to-br from-blue-500 via-blue-600 to-blue-700 text-white backface-hidden transform-[rotateY(180deg)] shadow-2xl border border-blue-400/50 transition-all group-hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)]">
          {card.value}
        </div>
      </div>
    </div>
  );
}
