const path = require('path');

module.exports = {
<% if (project.native) { -%>
  dependencies: {
    '<%- project.slug -%>': {
      root: path.join(__dirname, '..'),
    },
  },
<% } -%>
};
