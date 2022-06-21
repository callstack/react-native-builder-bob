const path = require('path');

module.exports = {
<% if (project.native) { -%>
  dependencies: {
    '<%- project.package %>': {
      root: path.join(__dirname, '..'),
    },
  },
<% } -%>
};
