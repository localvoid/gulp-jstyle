'use strict';

var path = require('path');
var child = require('child_process');
var gutil = require('gulp-util');
var through = require('through2');
var File = require('vinyl');

module.exports = function(options) {
  var executable = options && options.executable || 'jstyle';
  var minifyClassNames = options && options.minifyClassNames || false;
  var closureMap = options && options.closureMap || false;
  var closureMapPrefix = options && options.closureMapPrefix || 'css.map';

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-jstyle', 'Streaming not supported'));
      return cb();
    }

    var args = [];
    args.push('--json');
    if (minifyClassNames) {
      args.push('--minify-class-names');
    }
    args.push('--file');
    args.push(file.path);
    var proc = child.spawn(executable, args);

    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');

    var result = [];
    var error = [];

    var dirPath = path.dirname(file.path);
    var fileName = path.basename(file.path, '.js');

    proc.stdout.on('data', function(data) { result.push(data); });
    proc.stderr.on('data', function(data) { error.push(data); });

    proc.on('error', function(err) {
      this.emit('error', new gutil.PluginError('gulp-jstyle', err, {
        fileName: file.path
      }));
      cb();
    }.bind(this));

    proc.on('close', function(code) {
      if (code === 0) {
        var data = JSON.parse(result.join(''));
        for (var i = 0; i < data.entries.length; i++) {
          var entry = data.entries[i];
          this.push(new File({
            cwd: file.cwd,
            base: file.base,
            path: path.join(dirPath, entry.name),
            contents: new Buffer(entry.css)
          }));
        }
        var mapString = JSON.stringify(data.map, null, 2);
        if (minifyClassNames) {
          this.push(new File({
            cwd: file.cwd,
            base: file.base,
            path: path.join(dirPath, fileName + '_map.json'),
            contents: new Buffer(mapString)
          }));
        }
        if (closureMap) {
          this.push(new File({
            cwd: file.cwd,
            base: file.base,
            path: path.join(dirPath, fileName + '_map.js'),
            contents: new Buffer('goog.provide(\'' + closureMapPrefix + '.'+ fileName + '\');\n\n' +
                                 'goog.setCssNameMapping(' + mapString + ', \'BY_WHOLE\');\n')
          }));
        }
      } else {
        this.emit('error', new gutil.PluginError('gulp-jstyle', 'gulp-jstyle failed: ' + error, {
          fileName: file.path
        }));
      }
      cb();
    }.bind(this));
  });
};
