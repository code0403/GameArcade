import Cell from "./Cell";

export default function Board({ board, onCellClick, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          disabled={disabled}
          onClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
}
