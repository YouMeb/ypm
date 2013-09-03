'use strict';

var fs          = require('fs');
var path        = require('path');
var ncp         = require('ncp').ncp;
var async       = require('async');
var Provider    = require('../provider');
var provider    = module.exports = new Provider('local-tar');

ncp.limit = 16;

// 只要不符合前面所有類型，就假設他一定是目錄
provider.check = function (pkgname) {
  return true;
};

// 檢查目錄是否存在
provider.exists = function (pkgname, version, done) {
  fs.exists(pkgname, function (exists) {
    done(null, exists);
  });
};

// 直接回傳目錄位置
provider.install = function (pkgname, version, done) {
  done(null, pkgname);
};
