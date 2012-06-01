(function() {
  var TestBuilder, exec, path, util, _harnessMod,
    __slice = Array.prototype.slice;

  exec = require("child_process").exec;

  path = require("path");

  util = require("util");

  _harnessMod = path.join(__dirname, "harness.js");

  TestBuilder = (function() {

    function TestBuilder() {
      this._includePaths = [];
      this._testDefinitions = {};
      this._mochaReporter = process.env.MOCHA_REPORTER || 'spec';
      this._mochaUi = process.env.MOCHA_UI || 'tdd';
      this._harnessMod = path.join(__dirname, "harness.js");
      this._retVal = 0;
      this._preRequire = void 0;
    }

    TestBuilder.harnessModule = function() {
      return _harnessMod;
    };

    TestBuilder.prototype.harnessModule = TestBuilder.harnessModule;

    TestBuilder.prototype.preRequire = function(mod) {
      this._preRequire = mod;
      return this;
    };

    TestBuilder.prototype._mochaPreRequire = function() {
      var _ref;
      return (_ref = this._preRequire) != null ? _ref : _harnessMod;
    };

    TestBuilder.prototype.nodeEnv = function(_env) {
      this._env = _env;
    };

    TestBuilder.prototype.task = function(_task) {
      this._task = _task;
      return this;
    };

    TestBuilder.prototype.includePaths = function() {
      var path, paths, _i, _len;
      paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        this._includePaths.push(path);
      }
      return this;
    };

    TestBuilder.prototype.tests = function(_testDefinitions) {
      this._testDefinitions = _testDefinitions;
      return this;
    };

    TestBuilder.prototype.build = function() {
      var glob, test, _ref,
        _this = this;
      if (!this._task) "TestBuilder requires task function to define tasks.";
      _ref = this._testDefinitions;
      for (test in _ref) {
        glob = _ref[test];
        this._addTestTask(test, glob);
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
      return "NODE_PATH=$NODE_PATH:" + (this._includePaths.join(':')) + " mocha --globals window,document -u " + this._mochaUi + " -R " + this._mochaReporter + " --require " + (this._mochaPreRequire());
    };

    TestBuilder.prototype._runTests = function(glob, msg) {
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
      return exec("" + (this._testCmd()) + " " + glob, {
        env: childEnv,
        encoding: 'utf8'
      }, function(err, stdout, stderr) {
        util.puts(stdout);
        console.log(stderr);
        if (err !== null) return _this._retVal = 1;
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
