{exec} = require "child_process"
path   = require "path"
util   = require "util"
fs     = require 'fs'
glob   = require 'glob'

_harnessMod = path.join(__dirname, "harness.js")

class TestBuilder
  constructor: ->
    @_includePaths    = []
    @_testDefinitions = {}
    @_mochaReporter   = process.env.MOCHA_REPORTER || 'spec'
    @_mochaUi         = process.env.MOCHA_UI       || 'tdd'
    # Harness.js file out of the current dir
    @_harnessMod      = path.join(__dirname, "harness.js")
    @_retVal          = 0
    @_preRequire      = undefined
    @_globals         = ['window', 'document']

    # Pass in the handle for that Cakefile's task function
  @harnessModule: ->
    _harnessMod

  harnessModule: @harnessModule

  preRequire: (mod) ->
    @_preRequire = mod
    @

  _mochaPreRequire: ->
    @_preRequire ? _harnessMod

  nodeEnv: (@_env) ->

  task: (@_task) ->
    @

  # Paths to be included in the test process before running the test.
  includePaths: (paths...) ->
    @_includePaths.push path for path in paths
    @

  # Set any globals used in the app. Defaults to window and document
  setGlobals: (globals...) ->
    @_globals.push global for global in globals
    @

  # Test definitions:
  # tests =
  #   taskName: "test/glob/*.test.coffee"
  tests: (@_testDefinitions) ->
    @

  build: ->
    unless @_task
      "TestBuilder requires task function to define tasks."

    for test, testGlob of @_testDefinitions
      @_addTestTask test, testGlob


    @_task "test", "Run all tests", =>
      process.on 'exit', () =>
        process.reallyExit @retVal()
      for t of @_testDefinitions
        do (t) ->
          invoke "test:#{t}"
    @

  _testCmd: ->
    "NODE_PATH=$NODE_PATH:#{@_includePaths.join ':'} mocha --globals #{@_globals.join ','} -u #{@_mochaUi} -R #{@_mochaReporter} --require #{@_mochaPreRequire()}"

  # Run our test.  If we're running in xunit output mode, we want to
  # write each test file's output to a separate file, so that xunit
  # doesn't freak out.
  _runTests: (testGlob, msg) ->
    childEnv = {}
    childEnv[k] = v for k,v of process.env
    childEnv["NODE_ENV"] ?= (@_env ? "test")
    glob testGlob, (err, files) =>
      for file in files
        child = exec "#{@_testCmd()} #{file}",
          env: childEnv
          encoding: 'utf8'
        , (err, stdout, stderr) =>
          util.puts stdout    # verbiage
          console.log stderr  # test summary
        @_retVal = 1 if err != null
        if @_mochaReporter == 'xunit'
          fs.mkdirSync('reports') unless fs.readdirSync('.').indexOf('reports') >= 0
          outFile = fs.createWriteStream "reports/#{file.replace(/^.*[\\\/]/, '')}.xml", { flags : 'w' }
          child.stdout.pipe(outFile)

  _addTestTask: (name, dir) ->
    taskName = "test:#{name}"

    @_task "#{taskName}", "Run units on #{name}", =>
      @_runTests dir, "Starting #{name} tests..."

  retVal: ->
    @_retVal

module.exports = TestBuilder
