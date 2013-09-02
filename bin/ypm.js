#!/usr/bin/env node

'use strict';

var path = require('path');
var cliox = require('cliox');
var pkg = require('../package');
var cli = require('../lib/cli');
var app = cliox();

process.title = 'ypm';

app
  .version(pkg.version)
  .verbose()
  .help(path.join(__dirname, '../docs/cli'), 'help.%s.txt')
  .format({
    json: app.format.json
  });

app.bind(cli);

app.noCommand(function (app, done) {
  app.getHelpMessage(function (err, data) {
    console.log(data);
    done();
  });
});

app.run(process.argv.slice(2));
