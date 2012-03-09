(function() {
  var Builder, exec, glob, path, run;
  var __slice = Array.prototype.slice;

  exec = require("child_process").exec;

  path = require("path");

  glob = require("glob");

  run = function(command, cb) {
    if (cb == null) cb = (function() {});
    return exec(command, {
      env: process.env,
      encoding: 'utf8'
    }, function(err, stdout, stderr) {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      return cb(err, stdout, stderr);
    });
  };

  Builder = (function() {

    function Builder(projectRoot) {
      this._projectRoot = projectRoot;
      if (!this._projectRoot) {
        throw new Error("Builder requires a project root to be specified.");
      }
      this._inputDirs = [];
      this._absoluteInputDirs = [];
      this._outputDir = null;
      this._absoluteOutputDir = null;
      this._buildName = "unknown";
    }

    Builder.prototype.libraryName = function(_libName) {
      this._libName = _libName;
      return this;
    };

    Builder.prototype.buildName = function(_buildName) {
      this._buildName = _buildName;
      return this;
    };

    Builder.prototype.outputDir = function(_outputDir) {
      this._outputDir = _outputDir;
      this._absoluteOutputDir = path.join(this._projectRoot, this._outputDir);
      return this;
    };

    Builder.prototype.inputDirs = function() {
      var dir, dirs, _i, _len;
      dirs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._absoluteInputDirs = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        this._inputDirs.push(dir);
        this._absoluteInputDirs.push(path.join(this._projectRoot, dir));
      }
      return this;
    };

    Builder.prototype.build = function() {
      var libraryOutputDir;
      var _this = this;
      if (!this._libName) throw new Error("Library name required!");
      console.log("Building: " + this._buildName);
      libraryOutputDir = path.join(this._absoluteOutputDir, this._libName);
      console.log("Output dir for compilation: " + libraryOutputDir);
      return run("mkdir -p " + libraryOutputDir, function(err, stdout, stderr) {
        var dir, srcDirsToInclude;
        srcDirsToInclude = (function() {
          var _i, _len, _ref, _results;
          _ref = this._absoluteInputDirs;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            dir = _ref[_i];
            if (path.existsSync(dir)) _results.push(dir);
          }
          return _results;
        }).call(_this);
        console.log("Input dirs for compilation: " + srcDirsToInclude);
        if (path.existsSync(libraryOutputDir) && srcDirsToInclude.length > 0) {
          return run("coffee -o " + libraryOutputDir + " -c " + (srcDirsToInclude.join(" ")), function(err, stdout, stderr) {
            var dir, _i, _len, _ref, _results;
            _ref = _this._inputDirs;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              dir = _ref[_i];
              _results.push((function(dir) {
                return glob("" + dir + "/**/*.js", {}, function(er, files) {
                  var file, filePathSansInputDir, pathToCreate, reg, _j, _len2, _results2;
                  _results2 = [];
                  for (_j = 0, _len2 = files.length; _j < _len2; _j++) {
                    file = files[_j];
                    reg = RegExp("^" + dir + "\\/");
                    filePathSansInputDir = path.relative(_this._projectRoot, file).replace(reg, "");
                    pathToCreate = path.join(libraryOutputDir, path.dirname(filePathSansInputDir));
                    console.log("Ensuring directory exists: " + pathToCreate);
                    _results2.push(run("mkdir -p " + pathToCreate, function(err, stdout, stderr) {
                      console.log("Copying JS file from CS source: " + filePathSansInputDir);
                      return run("cp " + file + " " + (path.join(libraryOutputDir, filePathSansInputDir)));
                    }));
                  }
                  return _results2;
                });
              })(dir));
            }
            return _results;
          });
        } else {
          return console.log("No output dir, or no sources to build. Output dir: " + _this._absoluteOutputDir + "; Input dirs: " + _this._absoluteInputDirs + " for build: " + _this._buildName);
        }
      });
    };

    return Builder;

  })();

  module.exports = Builder;

}).call(this);
