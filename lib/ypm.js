'use strict';

var path  = require('path');
var utils = require('./utils');

var ypm = module.exports = {};

// 尋找 youmeb 目錄
ypm.youmebdir = function (done) {
  done = done || function () {};

  if (ypm._youmebdir) {
    return done(null, ypm._youmebdir.dir, ypm._youmebdir.exists);
  }

  utils.lookup(process.cwd(), false, function (err, dir, exists) {
    if (err) {
      return done(err);
    }

    ypm._youmebdir = {
      dir: dir,
      exists: exists
    };

    done(null, dir, exists);
  });
};

function addProperty(name) {
  if (name) {
    ypm[name] = require(path.join(__dirname, name))(ypm);
  }
  return addProperty;
};

addProperty()
  ('install');
