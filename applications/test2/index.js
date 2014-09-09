// The appended number allows us to refer to a specific device if multiple devices
// of the same name are found

// var gamepad = 'Logitech Dual Action #1'

var gamepad = 'Logitech RumblePad 2 USB #1'

module.exports = [
  // if no output object is found, simply call the expression with the provided input.
  { input: { io:gamepad, name:'button1' }, expression: function(v) { console.log(v, v * 15) } },
  
  // map to input blah2 on app test1
  { input: { io:gamepad, name:'button2' }, output:{ io:'test2', name:'blah2' } },
  
  { 
    input: { io:gamepad, name:'button3' }, 
    output:{ io:'test2', name:'blah3' },
    
    // expression is applied after affine transformation 
    expression: function(v) {
      return v * 1000
    }
  }
]