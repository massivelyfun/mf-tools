{exec} = require "child_process"
path = require "path"
util = require "util"
_harnessMod = path.join(__dirname, "harness.js")
class TestBuilder
  constructor: ->
    @_includePaths = []
    @_testDefinitions = {}
    @_mochaReporter = process.env.MOCHA_REPORTER || 'spec'
    @_mochaUi = process.env.MOCHA_UI || 'tdd'
    @_harnessMod = path.join(__dirname, "harness.js") # Harness.js file out of the current dir
    @_retVal = 0
    @_preRequire = undefined
  # Pass in the handle for that Cakefile's task function

  @harnessModule: ->
    _harnessMod

  harnessModule: @harnessModule

  preRequire: (mod) ->
    @_preRequire = mod
    @
  _mochaPreRequire: ->
    @_preRequire ? _harnessMod

  task: (@_task) ->
    @
  # Paths to be included in the test process before running the test.
  includePaths: (paths...) ->
    @_includePaths.push path for path in paths
    @
  # Test definitions:
  # tests =
  #   taskName: "test/glob/*.test.coffee"
  tests: (@_testDefinitions) ->
    @
  build: ->
    unless @_task
      "TestBuilder requires task function to define tasks."

    for test, glob of @_testDefinitions
      @_addTestTask test, glob


    @_task "test", "Run all tests", =>
      process.on 'exit', () =>
        process.reallyExit @retVal()
      for t of @_testDefinitions
        do (t) ->
          invoke "test:#{t}"
    @
  _testCmd: ->
    "NODE_PATH=$NODE_PATH:#{@_includePaths.join ':'} mocha --globals window,document -u #{@_mochaUi} -R #{@_mochaReporter} --require #{@_mochaPreRequire()}"

  _runTests: (glob, msg) ->
    exec "#{@_testCmd()} #{glob}",
      env: process.env
      encoding: 'utf8'
    , (err, stdout, stderr) ->
      # console.log "\n#{msg}\n==========================="
      util.puts stdout  # verbiage
      console.log stderr  # test summary

      @_retVal = 1 if err != null

  _addTestTask: (name, dir) ->
    taskName = "test:#{name}"

    @_task "#{taskName}", "Run units on #{name}", =>
      @_runTests dir, "Starting #{name} tests..."

  retVal: ->
    @_retVal

module.exports = TestBuilder
