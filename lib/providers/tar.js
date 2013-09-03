'use strict';

// 從 tar 安裝 package 無法設定 version
// 下載/解壓成功後丟給 callback 解壓後的目錄位置

var fs       = require('fs');
var path     = require('path');
var http     = require('http');
var async    = require('async');
var tar      = require('quill-tar');
var mkdirp   = require('mkdirp');
var consts   = require('../consts');
var utils    = require('../utils');
var Provider = require('../provider');
var provider = module.exports = new Provider('tar');
var debug    = require('debug')('ypm:install:tar');

provider.extnames = ['.tar', '.tar.gz', '.tgz', '.tar.bz', '.tbz', '.tar.bz2', '.tbz2'];

// 檢查是否是 tar 檔案
provider.check = function (pkgname) {
  if (!/^https?:\/\//.test(pkgname)) {
    return false;
  }
  var extname = path.extname(pkgname);
  return !!~provider.extnames.indexOf(extname);
};

// 檢查檔案是否存在
provider.exists = function (pkgname, version, done) {
  var stop = false;
  var req = http.get(pkgname, function (res) {
    res.on('data', function () {
      if (stop) {
        return;
      }
      stop = true;
      req.end();
      done(null, true);
    });
  })
    .on('error', function (err) {
      console.log(123);
      done(err);
    });
};

// 安裝 package
//
// 1. download
// 2. untar
//
provider.install = function (pkgname, version, done) {
  var data = {};

  async.series([
    provider.download(data, pkgname),
    provider.untar(data)
  ], function (err) {
    done(err, data.packageTmpDir);
  });
};

provider.download = function (data, url) {
  return function (done) {
    debug('download');
    utils.generateTmpDir(function (err, tmpDirPath) {
      if (err) {
        return done(err);
      }

      var tmpFilePath = path.join(tmpDirPath, 'package' + path.extname(url));

      http.get(url, function (res) {
        var tmpFile = fs.createWriteStream(tmpFilePath);

        res
          .on('error', function (err) {
            done(err);
          })
          .on('end', function () {
            data.tmpDirPath = tmpDirPath;
            data.tmpFilePath = tmpFilePath;
            done(null);
          })
          .pipe(tmpFile)
      });
    });
  };
};

provider.untar = function (data) {
  return function (done) {
    debug('untar');
    
    var dir = path.join(data.tmpDirPath, 'package');
    var stop = false;

    data.packageTmpDir = dir;

    tar.unpack(data.tmpFilePath, dir, {
      modes: {
        exec: +'0777' & (~+'022'),
        file: +'0666' & (~+'022'),
        umask: +'022'
      }
    }, function (err, target) {
      if (err) {
        return done(err);
      }
      utils.find(consts.PACKAGE_FILE, target, 2, function (err, dir) {
        data.packageTmpDir = dir;
        done(err);
      });
    });
  };
};
