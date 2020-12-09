import _ from 'lodash';
import $ from 'jquery';

const BLOCK_CLASSES = {
  BASE: 'minesweeper__block',
  STATES: {
    OPEN: 'minesweeper__block--open',
    RED: 'minesweeper__block--red',
    GREEN: 'minesweeper__block--green',
    FLAG: 'minesweeper__block--flag',
    BOMB: 'minesweeper__block--bomb',
    FIRST_BOMB: 'minesweeper__block--first-bomb',
  },
};

// map size and number of mines
const levels = {
  small: {
    rows: 15,
    columns: 12,
    mines: 10,
  },
  medium: {
    rows: 16,
    columns: 20,
    mines: 25,
  },
  large: {
    rows: 18,
    columns: 28,
    mines: 40,
  },
};

/**
 * @param {number} rows number of rows
 * @param {number} columns number of columns
 * @param {number} totalMines total of mines
 * @param {string} excludePosition position for first click
 */
function generateMinePositions(rows, columns, totalMines, excludePosition) {
  const minePositions = [];

  while (minePositions.length < totalMines) {
    const r = _.random(rows - 1);
    const c = _.random(columns - 1);
    const pos = `r${r}c${c}`;
    if (pos !== excludePosition && minePositions.indexOf(pos) === -1) {
      minePositions.push(pos);
    }
  }
  return minePositions;
}

/**
 * @param {number} rows number of rows
 * @param {number} columns number of columns
 * @param {array} minePositions array of mine positions
 */
function generateMap(rows, columns, minePositions) {
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

/**
 * @param {element} block element of block
 */
function getElementPosition(block) {
  const position = $(block).data('position');
  const r = position.substring(1, position.indexOf('c'));
  const c = position.substring(position.indexOf('c') + 1, position.length);
  return { row: Number(r), column: Number(c) };
}
export default class MapBuilder {
  constructor(level = 'medium') {
    this.level = level;
    this.gameOver = false;

    this.victoryModalNode = $('.victory-modal');
    this.victoryModalNode.removeClass('victory-modal--open');

    this.wrapperNode = $('.minesweeper');
    this.wrapperNode.empty().removeClass().addClass(['minesweeper', `minesweeper--${level}`]);

    this.lastBlocks = levels[level].rows * levels[level].columns - levels[level].mines;

    this.minesHiddenNode = $('#mines-hidden').text(levels[level].mines);
    this.minesHidden = levels[level].mines;

    this.minePositions = [];

    this.map = null;

    console.log(`Level: ${level}`);

    this.checkVictory = _.debounce(() => {
      if (this.lastBlocks <= 0) {
        this.victoryModalNode.addClass('victory-modal--open');
        console.log('You Won!');
        this.setGameOver();
      }
    });

    this.renderMap();
  }

  renderMap() {
    const { rows, columns } = levels[this.level];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < columns; c += 1) {
        const block = $('<div />');

        block.attr('data-position', `r${r}c${c}`)
          .addClass(BLOCK_CLASSES.BASE)
          .on('click', this.onBlockClick.bind(this, block))
          .on('contextmenu', this.onBlockRightClick.bind(this, block))
          .appendTo(this.wrapperNode);
      }
    }
  }

  generateMap(excludeBlock) {
    this.minePositions = generateMinePositions(
      levels[this.level].rows,
      levels[this.level].columns,
      levels[this.level].mines,
      excludeBlock.data('position'),
    );

    this.map = generateMap(
      levels[this.level].rows,
      levels[this.level].columns,
      this.minePositions,
    );

    console.log(`Mines: ${this.minePositions.length}`);
    console.log(`Map: \n${this.map.join('\n')}`);
  }

  onBlockClick(block) {
    if (this.map === null) this.generateMap(block);

    if (
      $(block).hasClass(BLOCK_CLASSES.STATES.OPEN)
      || $(block).hasClass(BLOCK_CLASSES.STATES.FLAG)
      || this.gameOver === true
    ) return;

    const { row, column } = getElementPosition(block);
    this.openBlock(row, column);
  }

  onBlockRightClick(block, event) {
    event.preventDefault();

    if (block.hasClass(BLOCK_CLASSES.STATES.OPEN) || this.gameOver) return;

    if (block.hasClass(BLOCK_CLASSES.STATES.FLAG)) {
      block.find('span').remove();
      block.removeClass(BLOCK_CLASSES.STATES.FLAG);
      this.minesHidden += 1;
      this.minesHiddenNode.text(this.minesHidden);
      return;
    }

    if (this.minesHidden < 1) return;

    $('<span>🚩</span>').appendTo(block);
    $(block).addClass(BLOCK_CLASSES.STATES.FLAG);
    this.minesHidden -= 1;
    this.minesHiddenNode.text(this.minesHidden);
  }

  openBlock(row, column) {
    // position beyond the map
    const blockValue = this.map[row] ? this.map[row][column] : undefined;
    if (blockValue === undefined) return;

    // have been opened
    const block = $(`.${BLOCK_CLASSES.BASE}[data-position="r${row}c${column}"]`, this.wrapperNode);
    if (block.hasClass(BLOCK_CLASSES.STATES.OPEN)) return;

    if (blockValue === '*') {
      block.addClass(BLOCK_CLASSES.STATES.FIRST_BOMB);
      $('<span>💩</span>').appendTo(block);
      this.showAllMines();
      return;
    }

    this.lastBlocks -= 1;
    block.addClass(BLOCK_CLASSES.STATES.OPEN);

    if (blockValue > 0) {
      // Setting the color
      if (blockValue === 2) {
        block.addClass(BLOCK_CLASSES.STATES.GREEN);
      } else if (blockValue > 2) {
        block.addClass(BLOCK_CLASSES.STATES.RED);
      }

      $(`<span>${blockValue}<span>`).appendTo(block);
      this.checkVictory();
      return;
    }

    this.openBlock(row - 1, column);
    this.openBlock(row + 1, column);
    this.openBlock(row, column - 1);
    this.openBlock(row, column + 1);

    this.checkVictory();
  }

  showAllMines() {
    for (let i = 0; i < this.minePositions.length; i += 1) {
      const block = $(`.${BLOCK_CLASSES.BASE}[data-position="${this.minePositions[i]}"]`, this.wrapperNode);
      if (block.hasClass(BLOCK_CLASSES.STATES.FIRST_BOMB) === false) {
        setTimeout(() => {
          block.addClass(BLOCK_CLASSES.STATES.BOMB);
          if (block.is(':empty')) $('<span>💩</span>').appendTo(block);
        }, 50 * i);
      }
    }
    this.setGameOver();
  }

  setGameOver() {
    console.log('========== Game Over ==========');
    this.gameOver = true;
  }
}
