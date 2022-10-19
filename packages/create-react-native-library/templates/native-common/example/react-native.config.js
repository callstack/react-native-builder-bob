const path = require('path');

module.exports = {
  dependencies: {
    '<%- project.slug -%>': {
      root: path.join(__dirname, '..'),
    },
  },
};
