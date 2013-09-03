'use strict';

// 所有來源都必是 tar 檔案
//
// 可用來源
//
//   1. tar 網址      直接下載 tar 並解壓縮
//   2. git           在 os.tmpdir() 建立 mirror，在從 mirror 產生 tar 格式的 archive，以 ypm-versions 紀錄版本資訊
//   3. github        把 user/repo 的格式轉成 git 網址，然後使用與 git 相同的方式安裝
//   4. npm           從 https://registry.npmjs.org/:id 取得 tar，還有其他詳細資訊
//   5. local folder  直接複製   
//   6. ymp ?         需要自己的 package 網站？
//
// 動作
//
//   1. 取得安裝位置
//   2. 檢查來源 (提供者) 類型
//   3. 檢查 package 是否存在 (包含版本)
//   4. 執行 provider 的 install function
//   5. 搬移目錄到 youmeb 目錄下

var fs        = require('fs');
var path      = require('path');
var mkdirp    = require('mkdirp');
var async     = require('async');
var ncp       = require('ncp').ncp;
var debug     = require('debug')('ypm:install');
var consts    = require('./consts');
var providers = require('./providers');

var install = {};

module.exports = function (ypm) { 
  var data = {};

  return function (pkgname, version, done) {
    async.series([
      install.lookup(data, ypm),               // 1
      install.check(data, pkgname),            // 2
      install.exists(data, pkgname, version),  // 3
      install.install(data, pkgname, version), // 4
      install.mv(data)                         // 5
    ], done);
  };
};

// 檢查並建立 youmeb 目錄
install.lookup = function (data, ypm) {
  return function (done) {
    debug('尋找 & 建立 youmeb 目錄');
    ypm.youmebdir(function (err, dir, exists) {
      if (err) {
        return done(err);
      }
      data.youmebdir = dir;
      if (!exists) {
        mkdirp(dir, function (err) {
          if (err) {
            return done(err);
          }
          ypm._youmebdir.exists = true;
          done(null);
        });
        return;
      }
      done(null);
    });
  };
};

// 檢查來源類型
install.check = function (data, pkgname) {
  return function (done) {
    debug('檢查來源類型');
    var i;
    for (i in providers) {
      if (providers.hasOwnProperty(i) && providers[i].check(pkgname)) {
        data.provider = providers[i];
        debug('來源: ' + i);
        done(null);
        return;
      }
    }
    done(new Error('Provider not found.'));
  };
};

// 檢查 package 是否存在
install.exists = function (data, pkgname, version) {
  return function (done) {
    debug('檢查 package 是否存在');
    data.provider.exists(pkgname, version, function (err, exists) {
      if (err) {
        return done(err);
      }
      if (!exists) {
        return done(new Error('\'' + pkgname + '\' does not exists.'));
      }
      done(null);
    });
  };
};

// 執行 install function
install.install = function (data, pkgname, version) {
  return function (done) {
    debug('執行 install function');
    data.provider.install(pkgname, version, function (err, dir) {
      if (err) {
        return done(err);
      }
      data.packageTmpDir = dir;
      done();
    });
  };
};

// 搬移
install.mv = function (data) {

  ncp.limit = 16;

  return function (done) {
    debug('搬移 package 目錄');
    var pkgfile = path.join(data.packageTmpDir, consts.PACKAGE_FILE);
    var pkg;
    var destination;

    try {
      pkg = require(pkgfile);
    } catch (e) {
      return done(e);
    }

    destination = path.join(data.youmebdir, pkg.name);

    ncp(data.packageTmpDir, destination, function (err) {
      done(err);
    });
  };
};
