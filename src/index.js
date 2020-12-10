import $ from 'jquery';
import 'regenerator-runtime/runtime';
import './assets/normalize.css';
import './assets/index.css';
import 'core-js/stable';
import Mousetrap from 'mousetrap';
import MapBuilder from './MapBuilder';

/**
 * Create a new map
 */
function updateMap() {
  console.log('========== New Game ==========');
  window.map = new MapBuilder($('[name="map-size"]:checked').val());
}

Mousetrap.bind('1', () => $('input[value="small"]').click());
Mousetrap.bind('2', () => $('input[value="medium"]').click());
Mousetrap.bind('3', () => $('input[value="large"]').click());
Mousetrap.bind('r', () => $('#reset').click());

(() => {
  updateMap();
  $('#reset').on('click', updateMap);
  $('[name="map-size"]').on('change', updateMap);
})();
