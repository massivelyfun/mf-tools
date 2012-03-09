assert = harness.assert

suite "Tests Will Run", () ->
  test "assertions get pulled in from harness", (done) ->
    assert.ok yes
    done()
