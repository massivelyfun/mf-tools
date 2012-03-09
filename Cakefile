{exec} = require "child_process"
{Builder} = require "./src/index"
baseDir = __dirname
builds =
  "lib": ["src"]

task "build", "Convert CoffeeScript sources into JS files", ->
  for build, dirs of builds
    new Builder(baseDir)
      .buildName(build)
      .outputDir(build)
      .inputDirs((dir for dir in dirs)...)
      .build()

