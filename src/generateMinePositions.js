import _ from 'lodash';

/**
 * @param {number} rows number of rows
 * @param {number} columns number of columns
 * @param {number} totalMines total of mines
 * @param {string} excludePosition position for first click
 */
export default function generateMinePositions(rows, columns, totalMines, excludePosition) {
  const minePositions = [];

  while (minePositions.length < totalMines) {
    const r = _.random(rows);
    const c = _.random(columns);
    const pos = `r${r}c${c}`;
    if (pos !== excludePosition && minePositions.indexOf(pos) === -1) {
      minePositions.push(pos);
    }
  }
  return minePositions;
}
