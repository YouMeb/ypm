'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var os = require('os');
var consts = require('./consts');

var utils = module.exports = {};

// 在 /tmp 下產生目錄
utils.generateTmpDir = function (done) {
  var name = Date.now() + '-' + (Math.random() * 0x100000000 + 1).toString(36);

  name = path.join(os.tmpdir(), name);
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
            fs.rmdir(file, next);
            return;
          }

          f = path.join(file, f);

          utils.rmr(f, next);
        })();
      });
    }).call();
  });
};

// 尋找並建立目錄
utils.lookup = function () {
  var dir, create, done;

  switch (arguments.length) {
    case 1:
      done = arguments[0];
      dir = process.cwd();
      create = true;
      break;
    case 2:
      dir = arguments[0];
      done = arguments[1];
      create = true;
      break;
    case 3:
      dir = arguments[0];
      create = arguments[1];
      done = arguments[2];
      break;
    default:
      done = function () {};
      create = true;
  }

  var defdir = path.join(dir, consts.YOUMEB_DIR);
  var lastpath = null;
  var currpath = dir;

  (function find() {
    // 如果已經到根目錄還是找不到 youmeb 目錄，就在原始位置建立 youmeb 目錄
    if (lastpath === currpath) {
      if (create) {
        mkdirp(defdir, function (err) {
          if (err) {
            return done(err);
          }
          done(null, defdir, true);
        });
      } else {
        done(null, defdir, false);
      }
      return;
    }
    // 檢查 youmeb 存不存在
    var dir = path.join(currpath, consts.YOUMEB_DIR);
    fs.exists(dir, function (exists) {
      if (exists) {
        done(null, dir, true);
        return;
      }
      // 還找到，繼續找
      lastpath = currpath;
      currpath = path.resolve(currpath, '../');
      find();
    });
  })();
};

// 向下搜尋兩層
utils.find = function (file, dir, deep, done) {
  if (typeof dir === 'function') {
    done = dir;
    dir = process.cwd();
  }

  done = done || function () {};

  var stop = false;
  var _done = done;

  done = function () {
    if (stop) {
      return;
    }
    stop = true;
    _done.apply(null, arguments);
  };

  (function next(dir, d, done) {
    if (stop) {
      return;
    }
    fs.stat(dir, function (err, stats) {
      if (err) {
        return done(err);
      }
      if (stats.isDirectory()) {
        var filepath = path.join(dir, file);
        fs.exists(filepath, function (exists) {
          if (exists) {
            done(null, path.resolve(filepath, '../'));
          } else if (d < deep) {
            fs.readdir(dir, function (err, files) {
              if (err) {
                return done(err);
              }
              files.forEach(function (file) {
                file = path.join(dir, file);
                next(file, d + 1, done);
              });
            });
          } else {
            done(new Error('File not found.'));
          }
        });
      }
    });
  })(dir, 0, done);
};
