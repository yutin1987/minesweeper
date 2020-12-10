import $ from 'jquery';

/**
 * @param {element} block element of block
 */
export default function getElementPosition(block) {
  const position = $(block).data('position');
  const r = position.substring(1, position.indexOf('c'));
  const c = position.substring(position.indexOf('c') + 1, position.length);
  return { row: Number(r), column: Number(c) };
}
