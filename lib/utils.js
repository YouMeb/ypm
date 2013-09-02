'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var os = require('os');

var utils = module.exports = {};

utils.generateTmpDir = function (dirname, done) {
  var name = Date.now() + '-' + (Math.random() * 0x100000000 + 1).toString(36);

  name = [os.tmpdir, name].join(path.sep);
  done = done || function () {};

  mkdirp(name, function (err) {
    if (err) {
      return done(err);
    }
    done(null, name);
  });
};

// rm -r
utils.rmr = function (file, done) {
  fs.stat(file, function (err, stats) {
    if (err) {
      return done(err);
    }

    (stats.isFile() ? function () {
      fs.unlink(file);
    } : function () {
      fs.readdir(file, function (err, files) {

        if (err) {
          return done(err);
        }

        var i = 0;

        (function next(err) {
          if (err) {
            return done(err);
          }

          var f = files[i++];

          if (!f) {
            fs.rmdir(file);
            return;
          }

          utils.rmr(f, next);
        })();
      });
    }).call();
  });
};
