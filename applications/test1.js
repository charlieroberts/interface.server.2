// The appended number allows us to refer to a specific device if multiple devices
// of the same name are found

// var gamepad = 'Logitech Dual Action #1'
var gamepad = 'Logitech RumblePad 2 USB #1'

module.exports = {
  name:'test1',

  receivers: [
    { type:'OSC', ip:'127.0.0.1', port:8080 },

    // no ip address means derive ip from handshake message
    { type:'OSC', port:18080 },

    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },
  ],
  
  inputs: {
    // set range of expected values. destinations can be scalar or array of scalars
    blah:  { min: 200, max: 300, receivers:0 },

    // if no receivers are specified, output goes to all receivers
    blah2: { min: 0, max: 1, },

    blah3: { min: 0, max: 1, receivers:[0,1] },
  },
  
  outputs :{},

  mappings: [
    // if no output object is found, simply call the expression with the provided input.
    { input: { io:'keypress', name:'a' }, expression: function(v) { console.log(v, v * 15) } },
    { input: { io:'keypress', name:'b' }, output:{ io:'test1', name:'blah2' } },

    { input: { io:gamepad, name:'button1' }, expression: function(v) { console.log(v, v * 15) } },

    // map to input blah2 on app test1
    { input: { io:gamepad, name:'button2' }, output:{ io:'test1', name:'blah2' } },

    { 
      input: { io:gamepad, name:'button3' }, 
      output:{ io:'test1', name:'blah3' },

      // expression is applied after affine transformation 
      expression: function(v) {
        return v * 1000
      }
    }
  ],
}