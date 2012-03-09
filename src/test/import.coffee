# Directly imports the exports from a given module into the provided namespace
exports.import = (namespace, mods...) ->
  for mod in mods
    module = require(mod)
    for key, obj of module
      namespace[key] = obj
