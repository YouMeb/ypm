'use strict';

module.exports = Provider;

var notDefinedError = new Error('Function not defined.');

function Provider(name) {
  var that = this;
  this.__defineSetter__('name', function () {
    return name;
  });
}

// 檢查是不是使用這個 provider
Provider.prototype.match = function (name) {
  throw notDefinedError;
};

// 檢查 package 是否存在
Provider.prototype.exists = function (name) {
  throw notDefinedError;
};

// 安裝 package
Provider.prototype.install = function (name) {
  throw notDefinedError;
};
