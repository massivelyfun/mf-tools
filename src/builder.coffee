{exec} = require "child_process"
path = require "path"
glob = require "glob"

run = (command, cb = (->)) ->
  exec command,
    env: process.env
    encoding: 'utf8'
  , (err, stdout, stderr) ->
    console.log stdout if stdout
    console.error stderr if stderr
    cb(err, stdout, stderr)



class Builder
  constructor: (projectRoot) ->
    @_projectRoot = projectRoot
    unless @_projectRoot
      throw new Error("Builder requires a project root to be specified.")
    @_inputDirs = []
    @_absoluteInputDirs = []
    @_outputDir = null
    @_absoluteOutputDir = null
    @_buildName = "unknown"
  buildName: (@_buildName) ->
    @
  outputDir: (@_outputDir) ->
    @_absoluteOutputDir = path.join(@_projectRoot, @_outputDir)
    @
  inputDirs: (dirs...) ->
    @_absoluteInputDirs = []
    for dir in dirs
      @_inputDirs.push dir
      @_absoluteInputDirs.push path.join(@_projectRoot, dir)
    @
  build: ->
    console.log "Building: #{@_buildName}"
    console.log "Output dir for compilation: #{@_absoluteOutputDir}"
    srcDirsToInclude = (dir for dir in @_absoluteInputDirs when path.existsSync(dir))
    console.log "Input dirs for compilation: #{srcDirsToInclude}"
    if path.existsSync(@_absoluteOutputDir) and srcDirsToInclude.length > 0
      run "coffee -o #{@_absoluteOutputDir} -c #{srcDirsToInclude.join(" ")}", (err, stdout, stderr) =>
        # Then, copy .js files from each of the input dirs, and overlay them appropriately on the output
        for dir in @_inputDirs
          do (dir) =>
            glob "#{dir}/**/*.js", {}, (er, files) =>
              for file in files
                reg = ///
                  ^#{dir}\/
                ///
                filePathSansInputDir = path.relative(@_projectRoot, file).replace(reg, "")
                pathToCreate = path.join(@_absoluteOutputDir, path.dirname(filePathSansInputDir))
                console.log "Ensuring directory exists: #{pathToCreate}"
                run "mkdir -p #{pathToCreate}", (err, stdout, stderr) =>
                  console.log "Copying JS file from CS source: #{filePathSansInputDir}"
                  run "cp #{file} #{path.join(@_absoluteOutputDir, filePathSansInputDir)}"

    else
      console.log "No output dir, or no sources to build. Output dir: #{@_absoluteOutputDir}; Input dirs: #{@_absoluteInputDirs} for build: #{@_buildName}"

module.exports = Builder
