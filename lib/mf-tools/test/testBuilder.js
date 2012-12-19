(function() {
  var TestBuilder, exec, fs, glob, path, util,
    __slice = Array.prototype.slice;

  exec = require("child_process").exec;

  path = require("path");

  util = require("util");

  fs = require('fs');

  glob = require('glob');

  TestBuilder = (function() {

    function TestBuilder() {
      this._includePaths = [];
      this._testDefinitions = {};
      this._mochaReporter = process.env.MOCHA_REPORTER || 'spec';
      this._mochaUi = process.env.MOCHA_UI || 'tdd';
      this._harnessMod = "harness.js";
      this._retVal = 0;
      this._preRequire = void 0;
      this._globals = ['window', 'document'];
    }

    TestBuilder.harnessModule = function() {
      return this._harnessMod;
    };

    TestBuilder.prototype.harnessModule = TestBuilder.harnessModule;

    TestBuilder.prototype.preRequire = function(mod) {
      this._preRequire = mod;
      return this;
    };

    TestBuilder.prototype._mochaPreRequire = function() {
      var p;
      if (this._preRequire) {
        return this._preRequire;
      } else {
        p = path.join('lib', 'mf-tools', 'test', this._harnessMod);
        if (require.main.filename.indexOf('mf-tools') < 0) {
          return path.join('mf-tools', p);
        } else {
          return p;
        }
      }
    };

    TestBuilder.prototype.nodeEnv = function(_env) {
      this._env = _env;
    };

    TestBuilder.prototype.task = function(_task) {
      this._task = _task;
      return this;
    };

    TestBuilder.prototype.includePaths = function() {
      var p, paths, _i, _len;
      paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        this._includePaths.push(p);
      }
      return this;
    };

    TestBuilder.prototype.setGlobals = function() {
      var g, globals, _i, _len;
      globals = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = globals.length; _i < _len; _i++) {
        g = globals[_i];
        this._globals.push(g);
      }
      return this;
    };

    TestBuilder.prototype.tests = function(_testDefinitions) {
      this._testDefinitions = _testDefinitions;
      return this;
    };

    TestBuilder.prototype.build = function() {
      var test, testGlob, _ref,
        _this = this;
      if (!this._task) "TestBuilder requires task function to define tasks.";
      _ref = this._testDefinitions;
      for (test in _ref) {
        testGlob = _ref[test];
        this._addTestTask(test, testGlob);
      }
      this._task("test", "Run all tests", function() {
        var t, _results;
        process.on('exit', function() {
          return process.reallyExit(_this.retVal());
        });
        _results = [];
        for (t in _this._testDefinitions) {
          _results.push((function(t) {
            return invoke("test:" + t);
          })(t));
        }
        return _results;
      });
      return this;
    };

    TestBuilder.prototype._testCmd = function() {
      return "NODE_PATH=$NODE_PATH:" + (this._includePaths.join(':')) + " mocha --globals " + (this._globals.join(',')) + " -u " + this._mochaUi + " -R " + this._mochaReporter + " --require " + (this._mochaPreRequire());
    };

    TestBuilder.prototype._runTests = function(testGlob, msg) {
      var childEnv, k, v, _ref, _ref2,
        _this = this;
      childEnv = {};
      _ref = process.env;
      for (k in _ref) {
        v = _ref[k];
        childEnv[k] = v;
      }
      if (childEnv["NODE_ENV"] == null) {
        childEnv["NODE_ENV"] = (_ref2 = this._env) != null ? _ref2 : "test";
      }
      return glob(testGlob, function(err, files) {
        var child, file, outFile, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          child = exec("" + (_this._testCmd()) + " " + file, {
            env: childEnv,
            encoding: 'utf8'
          }, function(err, stdout, stderr) {
            util.puts(stdout);
            return console.log(stderr);
          });
          if (err !== null) _this._retVal = 1;
          if (_this._mochaReporter === 'xunit') {
            if (!(fs.readdirSync('.').indexOf('reports') >= 0)) {
              fs.mkdirSync('reports');
            }
            outFile = fs.createWriteStream("reports/" + (file.replace(/^.*[\\\/]/, '')) + ".xml", {
              flags: 'w'
            });
            _results.push(child.stdout.pipe(outFile));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    };

    TestBuilder.prototype._addTestTask = function(name, dir) {
      var taskName,
        _this = this;
      taskName = "test:" + name;
      return this._task("" + taskName, "Run units on " + name, function() {
        return _this._runTests(dir, "Starting " + name + " tests...");
      });
    };

    TestBuilder.prototype.retVal = function() {
      return this._retVal;
    };

    return TestBuilder;

  })();

  module.exports = TestBuilder;

}).call(this);
