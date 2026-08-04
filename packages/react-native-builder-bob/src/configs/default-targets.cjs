/* eslint-disable import-x/no-commonjs, no-undef */

const browsers = [
  '> 1%',
  'chrome 109',
  'edge 124',
  'firefox 127',
  'safari 17.4',
  'not dead',
  'not ie <= 11',
  'not op_mini all',
  'not android <= 4.4',
  'not samsung <= 4',
];

const node = '18';

module.exports = {
  babel: { browsers, node },
  browserslist: [...browsers, `node ${node}`],
};
