import _ from 'lodash';
import generateMinePositions from '../generateMinePositions';

it('successfully generate mine positions', () => {
  const positions = generateMinePositions(15, 12, 10, ['r1c1']);
  expect(_.uniq(positions).length).toBe(10);
  expect(positions).not.toContain('r1c1');
});