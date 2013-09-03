'use strict';

// 檢查類型的部份都只是依照字串格式的不同去作分類
// ，不知道這樣會不會有問題，遇到腦包把 git 路徑設
// 成 http://xxx.xxx/repo.tar 的時候程式會判斷錯誤
// ，不過這種腦包應該不多？

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
  ('localTar')
  //('git')
  //('github')
  //('npm')
  //('local')
  ('folder');
