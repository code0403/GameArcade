import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GameCard({ name, path, available = true }) {
  const className = cn(
    "flex items-center justify-center font-bold py-6 px-4 rounded-lg text-center transition-colors",
    available
      ? "bg-gray-800 hover:bg-gray-700 text-white"
      : "bg-gray-800/40 text-gray-500 cursor-not-allowed"
  );

  if (!available) {
    return (
      <div className={className}>
        {name}
        <span className="block text-xs font-normal text-gray-500 mt-1">Coming soon</span>
      </div>
    );
  }

  return (
    <Link href={path} className={className}>
      {name}
    </Link>
  );
}
