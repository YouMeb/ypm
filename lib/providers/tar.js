'use strict';

// 從 tar 安裝 package 無法設定 version
// 下載/解壓成功後丟給 callback 解壓後的目錄位置

var path     = require('path');
var http     = require('http');
var async    = require('async');
var tar      = require('tar');
var mkdirp   = require('mkdirp');
var utils    = require('../utils');
var Provider = require('../provider');
var provider = module.exports = new Provider('tar');

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
  http.get(pkgname, function (res) {
    done(null, [200, 304].indexOf(res.statusCode));
  }, function (err) {
    done(err);
  });
};

// 安裝 package
//
// 1. download
// 2. untar
//
provider.install = function (pkgname, version, done) {
  var that = this;

  async.waterfall([
    // download
    function (done) {
      that.download(pkgname, done);
    },
    // untar
    function (tmpdir, tarfile, done) {
      that.untar(tarfile, path.join(tmpdir, 'package'), done);
    }
  ], done);
};

provider.download = function (url, done) {
  utils.generateTmpDir(function (err, tmpDirPath) {
    if (err) {
      return done(err);
    }

    var tmpFilePath = path.join([tmpFilePath, 'package.tar'], path.sep);

    http.get(url, function (res) {
      var tmpFile = fs.createWriteStream(tmpFilePath);

      res
        .pipe(tmpFile);
        .on('error', function (err) {
          done(err);
        })
        .on('end', function () {
          done(null, tmpDirPath, tmpFilePath);
        });
    });
  });
};

provider.untar = function (tarfile, dir, done) {

  mkdirp(dir, function (err) {
    if (err) {
      return done(err);
    }

    fs.createReadStream(tarfile)
      .pipe(tar.Extract({
        path: dir
      }))
      .on('error', function (err) {
        utils.rmr(dir, function (err2) {
          done(err2 || err);
        });
      })
      .on('end', function () {
        done(null, dir);
      });
  });
};
