'use strict';

var path = require('path');
var cli = module.exports = {};

function addCommand(name) {
  if (name) {
    cli[name] = path.join(__dirname, 'commands', name);
  }
  return addCommand;
};

addCommand()
  ('install')
  ('uninstall')
  ('list')
  ('update')
  ('version');
