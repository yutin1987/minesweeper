import _ from 'lodash';
import $ from 'jquery';
import generateMinePositions from './generateMinePositions';
import generateMapValue from './generateMapValue';
import getElementPosition from './getElementPosition';

const BLOCK_CLASSES = {
  BASE: 'minesweeper__block',
  STATES: {
    OPEN: 'minesweeper__block--open',
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

  generateMapValue(excludeBlock) {
    this.minePositions = generateMinePositions(
      levels[this.level].rows,
      levels[this.level].columns,
      levels[this.level].mines,
      excludeBlock.data('position'),
    );

    this.map = generateMapValue(
      levels[this.level].rows,
      levels[this.level].columns,
      this.minePositions,
    );

    console.log(`Mines: ${this.minePositions.length}`);
    console.log(`Map: \n${this.map.join('\n')}`);
  }

  onBlockClick(block) {
    if (this.map === null) this.generateMapValue(block);

    if (
      block.hasClass(BLOCK_CLASSES.STATES.OPEN)
      || block.hasClass(BLOCK_CLASSES.STATES.FLAG)
      || this.gameOver === true
    ) return;

    const { row, column } = getElementPosition(block);
    this.openBlock(row, column);
  }

  onBlockRightClick(block, event) {
    event.preventDefault();

    if (block.hasClass(BLOCK_CLASSES.STATES.OPEN) || this.gameOver) return;

    if (block.hasClass(BLOCK_CLASSES.STATES.FLAG)) {
      block.empty();
      block.removeClass(BLOCK_CLASSES.STATES.FLAG);
      this.minesHidden += 1;
      this.minesHiddenNode.text(this.minesHidden);
      return;
    }

    if (this.minesHidden < 1) return;

    $('<span>🚩</span>').appendTo(block);
    block.addClass(BLOCK_CLASSES.STATES.FLAG);
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
    block.removeClass(BLOCK_CLASSES.STATES.FLAG);
    block.addClass(BLOCK_CLASSES.STATES.OPEN);
    block.empty();

    if (blockValue > 0) {
      // Setting the color
      if (blockValue === 2) {
        block.addClass(BLOCK_CLASSES.STATES.GREEN);
      } else if (blockValue > 2) {
        block.addClass(BLOCK_CLASSES.STATES.RED);
      }

      $(`<span class="tip">${blockValue}</span>`).appendTo(block);
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
