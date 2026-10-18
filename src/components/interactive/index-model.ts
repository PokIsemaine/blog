export function lookup(size: number, target: number, indexed: boolean) {
  let comparisons = 0;
  let found = -1;
  if (indexed) {
    let low = 1,
      high = size;
    while (low <= high) {
      comparisons++;
      const mid = Math.floor((low + high) / 2);
      if (mid === target) {
        found = mid;
        break;
      }
      if (mid < target) low = mid + 1;
      else high = mid - 1;
    }
  } else {
    for (let row = 1; row <= size; row++) {
      comparisons++;
      if (row === target) {
        found = row;
        break;
      }
    }
  }
  return { comparisons, found };
}
