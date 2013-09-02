'use strict';

var path = require('path');
var ypm = module.exports = {};

function addProperty(name) {
  if (name) {
    ypm[name] = path.join(__dirname, name);
  }
  return addProperty;
};

addProperty()
  ('install');
