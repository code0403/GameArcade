export function createDeck(json, gridSize) {
  const totalCards = gridSize * gridSize;
  const isOdd = totalCards % 2 !== 0;
  const pairsNeeded = Math.floor(totalCards / 2);

  const selectedValues = json.slice(0, pairsNeeded);
  
  // Create pairs
  const pairs = selectedValues.flatMap((item) => [
    {id:crypto.randomUUID(), value: item.value, flipped: false, matched: false},
    {id:crypto.randomUUID(), value: item.value, flipped: false, matched: false}
  ]);

  // For odd grid sizes, add one extra unpaired card
  if (isOdd && json.length > pairsNeeded) {
    pairs.push({
      id: crypto.randomUUID(),
      value: json[pairsNeeded].value,
      flipped: false,
      matched: false
    });
  }

  return pairs.sort(() => Math.random() - 0.5);
}
