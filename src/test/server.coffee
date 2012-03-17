spawn = require("child_process").spawn
path = require "path"

servers = {}
server = {}
server.launch = (appMagic, serverScript, port, connect, timeout, exitCb) ->
  return servers[port] if servers[port]

  if typeof timeout == 'function'
    exitCb = timeout
    timeout = null

  testPort = parseInt(port || 4001)
  endpoint = "http://localhost:#{testPort}/"

  #console.log "Launching a server on port #{testPort}"

  # Bring up a server
  started = false
  connected = false
  completed = false

  serverProc = spawn "node", [serverScript, '-p', testPort],
    cwd: appMagic.appRoot()
    env: appMagic.appEnv()
    setsid: false

  # serverProc.stdout.on 'data', (data) ->
  #   console.log 'OUT: ', data.toString 'utf8'
  #
  # serverProc.stderr.on 'data', (data) ->
  #   console.log 'ERR: ', data.toString 'utf8'

  # Mongoose writes to stderr as it starts, after the server is listening on testPort
  if connect
    serverProc.stderr.on 'data', (data) ->
      started = true
      connected = connect() unless connected

  serverProc.on 'exit', (code) ->
    completed = true
    exitCb?(code)

  serverProc.timeOut = setTimeout () ->
    if started
      server.kill(testPort)
  , timeout || 5000

  servers[port] = serverProc

  server

server.kill = (port) ->
  if (servers[port])
    clearTimeout servers[port].timeOut
    servers[port].kill('SIGTERM')
    delete servers[port]

server.running = (port) ->
  servers[port]?

server.stopped = (port) ->
  !server.running(port)

module.exports.server = server
