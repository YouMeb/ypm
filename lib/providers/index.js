'use strict';

var providers = module.exports = {};

function addProvider(name) {
  if (name) {
    providers[name] = path.join(__dirname, name);
  }
  return addProvider;
};

addProvider()
  ('tar')
  ('local-tar')
  ('git')
  ('github')
  ('npm')
  ('local');
