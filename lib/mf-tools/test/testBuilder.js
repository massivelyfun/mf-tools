(function() {
  var TestBuilder, exec, path, util;
  var __slice = Array.prototype.slice;

  exec = require("child_process").exec;

  path = require("path");

  util = require("util");

  TestBuilder = (function() {

    function TestBuilder() {
      this._includePaths = [];
      this._testDefinitions = {};
      this._mochaReporter = process.env.MOCHA_REPORTER || 'spec';
      this._mochaUi = process.env.MOCHA_UI || 'tdd';
      this._harnessDir = path.join(__dirname, "harness.js");
      this._retVal = 0;
    }

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
      var glob, test, _ref;
      var _this = this;
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
      return "NODE_PATH=$NODE_PATH:" + (this._includePaths.join(':')) + " mocha --globals window,document -u " + this._mochaUi + " -R " + this._mochaReporter + " --require " + this._harnessDir;
    };

    TestBuilder.prototype._runTests = function(glob, msg) {
      return exec("" + (this._testCmd()) + " " + glob, {
        env: process.env,
        encoding: 'utf8'
      }, function(err, stdout, stderr) {
        util.puts(stdout);
        console.log(stderr);
        if (err !== null) return this._retVal = 1;
      });
    };

    TestBuilder.prototype._addTestTask = function(name, dir) {
      var taskName;
      var _this = this;
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
