const _ = require('lodash');

context('player', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9000/');
    cy.get('.minesweeper').as('minesweeper');
  });

  it('first click will never be a mine', () => {
    cy.get(`[data-position="r${_.random(15 - 1)}c${_.random(12 - 1)}"]`)
      .click();

    cy.get('.minesweeper .tip').should('to.exist');
  });
});
