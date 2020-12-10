/**
 * @param {number} rows number of rows
 * @param {number} columns number of columns
 * @param {array} minePositions array of mine positions
 */
export default function generateMapValue(rows, columns, minePositions) {
  const map = [];

  // Creates map with mines
  for (let r = 0; r < rows; r += 1) {
    map[r] = [];
    for (let c = 0; c < columns; c += 1) {
      map[r][c] = minePositions.indexOf(`r${r}c${c}`) !== -1 ? '*' : '0';
    }
  }

  let total = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      if (map[r][c] !== '*') {
        total = 0;

        if (r > 0) {
          // Top left element
          if (map[r - 1][c - 1] === '*') total += 1;
          // Top element
          if (map[r - 1][c] === '*') total += 1;
          // Top right element
          if (map[r - 1][c + 1] === '*') total += 1;
        }
        // Left element
        if (map[r][c - 1] === '*') total += 1;
        // Right element
        if (map[r][c + 1] === '*') total += 1;
        if (r < rows - 1) {
          // Bottom left element
          if (map[r + 1][c - 1] === '*') total += 1;
          // Bottom element
          if (map[r + 1][c] === '*') total += 1;
          // Bottom right element
          if (map[r + 1][c + 1] === '*') total += 1;
        }

        map[r][c] = total;
      }
    }
  }

  return map;
}
