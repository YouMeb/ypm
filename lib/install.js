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

module.exports = function () {
  
};
