'use strict';

var path = require('path');
var providers = module.exports = {};

function addProvider(name) {
  if (name) {
    providers[name] = require(path.join(__dirname, name));
  }
  return addProvider;
};

addProvider()
  ('tar')
  ('localTar');
  //('git')
  //('github')
  //('npm')
  //('local');
