{exec} = require "child_process"
path = require "path"
util = require "util"
fs   = require 'fs'
glob = require 'glob'

class TestBuilder
  constructor: ->
    @_includePaths = []
    @_testDefinitions = {}
    @_mochaReporter = process.env.MOCHA_REPORTER || 'spec'
    @_mochaUi = process.env.MOCHA_UI || 'tdd'
    @_harnessMod = "harness.js" # Harness.js file out of the current dir
    @_retVal = 0
    @_preRequire = undefined
    @_globals = ['window', 'document']
  # Pass in the handle for that Cakefile's task function

  @harnessModule: ->
    @_harnessMod

  harnessModule: @harnessModule

  preRequire: (mod) ->
    @_preRequire = mod
    @
  _mochaPreRequire: ->
    if @_preRequire
      @_preRequire
    else
      p = path.join('lib', 'mf-tools', 'test', @_harnessMod)
      #
      # Mocha 1.6 has this:
      # 
      # program.on('require', function(mod){
      #   var abs = exists(mod)
      #     || exists(mod + '.js');

      #   if (abs) mod = join(cwd, mod);
      #   require(mod);
      # });
      # 
      # Because of this, we can no longer specify absolute paths to modules when passing them
      # to Mocha via -r below.  Instead, we look at the path of the main script - if it includes
      # mf-tools, we're running local tests for the mf-tools module.  If it doesn't, we're running
      # out of node_modules (though __dirname may not reflect this in the npm link'd case). Set the
      # require path appropriately.
      # 
      # TODO: remove this when Mocha is sane again.
      if require.main.filename.indexOf('mf-tools') < 0 then path.join('mf-tools', p) else p

  nodeEnv: (@_env) ->
  task: (@_task) ->
    @
  # Paths to be included in the test process before running the test.
  includePaths: (paths...) ->
    @_includePaths.push p for p in paths
    @

  setGlobals: (globals...) ->
    @_globals.push g for g in globals
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

  # Run our test.  If we're running in xunit output mode, we want to write each test file's
  # output to a separate file, so that xunit doesn't freak out.
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
          # console.log "\n#{msg}\n==========================="
          util.puts stdout  # verbiage
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
