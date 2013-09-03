'use strict';

var fs          = require('fs');
var path        = require('path');
var async       = require('async');
var utils       = require('../utils');
var tarProvider = require('./tar');
var Provider    = require('../provider');
var provider    = module.exports = new Provider('local-tar');

// 檢查是否是 tar 檔案
provider.check = function (pkgname) {
  if (/^https?:\/\//.test(pkgname)) {
    return false;
  }
  var extname = path.extname(pkgname);
  return !!~tarProvider.extnames.indexOf(extname);
};

// 檢查檔案是否存在
provider.exists = function (pkgname, version, done) {
  fs.exists(pkgname, function (exists) {
    done(null, exists);
  });
};

// 解壓到 tempdir
provider.install = function (pkgname, version, done) {
  var data = {};

  async.series([
    function (done) {
      utils.generateTmpDir(function (err, dir) {
        if (err) {
          return done(err);
        }
        data.tmpDirPath = dir;
        data.tmpFilePath = pkgname;
        done(null);
      });
    },
    tarProvider.untar(data)
  ], function (err) {
    done(err, data.packageTmpDir);
  });
};
