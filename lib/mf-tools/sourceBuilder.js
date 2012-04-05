(function() {
  var Builder, exec, glob, path, run,
    __slice = Array.prototype.slice;

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
      var dir, dirs, _fn, _i, _len,
        _this = this;
      dirs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._absoluteInputDirs = [];
      _fn = function(dir) {
        _this._inputDirs.push(dir);
        return _this._absoluteInputDirs.push(path.join(_this._projectRoot, dir));
      };
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        _fn(dir);
      }
      return this;
    };

    Builder.prototype.build = function() {
      var libraryOutputDir,
        _this = this;
      if (!this._libName) throw new Error("Library name required!");
      console.log("Building: " + this._buildName);
      libraryOutputDir = path.join(this._absoluteOutputDir, this._libName);
      console.log("Output dir for compilation: " + libraryOutputDir);
      return run("mkdir -p " + libraryOutputDir, function(err, stdout, stderr) {
        var coffeeSourceDir, dir, srcDirsToInclude, _i, _len, _results;
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
          _results = [];
          for (_i = 0, _len = srcDirsToInclude.length; _i < _len; _i++) {
            coffeeSourceDir = srcDirsToInclude[_i];
            _results.push((function(coffeeSourceDir) {
              console.log("coffee -o " + libraryOutputDir + " -c " + coffeeSourceDir);
              return run("coffee -o " + libraryOutputDir + " -c " + coffeeSourceDir, function(err, stdout, stderr) {
                var dir, _j, _len2, _ref, _results2;
                _ref = _this._inputDirs;
                _results2 = [];
                for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                  dir = _ref[_j];
                  _results2.push((function(dir) {
                    return glob("" + dir + "/**/*.js", {}, function(er, files) {
                      var file, _k, _len3, _results3;
                      _results3 = [];
                      for (_k = 0, _len3 = files.length; _k < _len3; _k++) {
                        file = files[_k];
                        _results3.push((function(file) {
                          var filePathSansInputDir, pathToCreate, reg;
                          reg = RegExp("^" + dir + "\\/");
                          filePathSansInputDir = path.relative(_this._projectRoot, file).replace(reg, "");
                          pathToCreate = path.join(libraryOutputDir, path.dirname(filePathSansInputDir));
                          console.log("Ensuring directory exists: " + pathToCreate);
                          return run("mkdir -p " + pathToCreate, function(err, stdout, stderr) {
                            console.log("Copying JS file from CS source: " + filePathSansInputDir);
                            return run("cp " + file + " " + (path.join(libraryOutputDir, filePathSansInputDir)));
                          });
                        })(file));
                      }
                      return _results3;
                    });
                  })(dir));
                }
                return _results2;
              });
            })(coffeeSourceDir));
          }
          return _results;
        } else {
          return console.log("No output dir, or no sources to build. Output dir: " + _this._absoluteOutputDir + "; Input dirs: " + _this._absoluteInputDirs + " for build: " + _this._buildName);
        }
      });
    };

    return Builder;

  })();

  module.exports = Builder;

}).call(this);
