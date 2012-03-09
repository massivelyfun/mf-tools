# Usage:
# 
# group exports, (t) ->
#   t 'String#length', ->
#     assert.equal(1, "1".length)

exports.group = (groupName, ex, fun) ->
  t = (name, test) ->
    console.log("Prepping test: test #{name}")
    ex['test ' + name] = test
  console.log("Prepping group: #{groupName}")
  fun(t)
