process.env["PATH"] = "node_modules/.bin:#{process.env["PATH"]}"

{exec} = require "child_process"
{SourceBuilder:Builder, TestBuilder:TestBuilder} = require "./src/index"
baseDir = __dirname
builds =
  "lib": ["src"]

task "build", "Convert CoffeeScript sources into JS files", ->
  for build, dirs of builds
    new Builder(baseDir)
      .libraryName("mf-tools")
      .buildName(build)
      .outputDir(build)
      .inputDirs((dir for dir in dirs)...)
      .build()

testBuilder = new TestBuilder()
  .includePaths("lib")
  .tests({
    alive: "test/alive/*.test.coffee"
  })
  .task(task)
  .build()
