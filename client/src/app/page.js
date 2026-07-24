import GameCard from "@/components/game-common/GameCard";

const games = [
  { name: "Memory Game", path: "/games/memory", available: true },
  { name: "Tic Tac Toe", path: "/games/tictactoe", available: true },
  { name: "Ludo", path: "/games/ludo", available: true },
  { name: "Quiz", path: "/games/quiz", available: true },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-xl text-semibold text-gray-300 p-8">Game Arcade</h1>

      <div className="grid grid-cols-2 gap-6">
        {games.map((game) => (
          <GameCard key={game.name} {...game} />
        ))}
      </div>
    </main>
  );
}
