// The appended number allows us to refer to a specific device if multiple devices
// of the same name are found

// var gamepad = 'Logitech Dual Action #1',
var gamepad = 'PLAYSTATION(R)3 Controller #1',
    gamepad2 = 'PLAYSTATION(R)3 Controller #2',
//var gamepad = 'Logitech RumblePad 2 USB #1',
    count = 0

module.exports = {
  name:'test1',

  transports: [
    { type:'osc', port:10080 },
    
    // TODO: ADDING A SEPARATE TRANSPORT SENDS DUPLICATE MESSAGES
    
    // no ip address means derive ip from handshake message
    { type:'osc', port:18080 },

    { type:'zmq', ip:'127.0.0.1', port:10080 },
  ],
  
  inputs: {
    // set range of expected values. destinations can be scalar or array of scalars
    blah:  { min: 200, max: 300 },

    // if no transports are specified, output goes to all transports
    blah2: { min: 0, max: 1, },

    blah3: { min: 0, max: 1, transports:[0,1] },
  },
  
  outputs :{},

  mappings: [
    // if no output object is found, simply call the expression with the provided input.
    { input: { io:'keyboard', name:'a' }, output:{ io:'test1', name:'blah' } },//, expression: function(v) { return 1999 } },
    //{ input: { io:'mouse', name:'x'}, expression: function(v){ console.log( v ) } },
    //{ input: { io:'mouse', name:'leftButton'}, expression: function(v){ console.log( "MOUSE BUTTON", v ) } },    
    // {
    //   input: { io:'keyboard', name:'b' },
    //   output:{ io:'test1', name:'blah2' },
    //   expression: function() { return count++ }
    // },
    { input: { io:'spacenavigator', name:'tx' }, output:{ io:'test1', name:'blah'} },
    //{ input: { io:gamepad, name:'buttonL1Analog' }, expression: function(v) { console.log("X", v ) } },
    //{ input: { io:gamepad2, name:'buttonL1Analog' }, expression: function(v) { console.log("X2", v ) } },

    // map to input blah2 on app test1
    // { input: { io:gamepad, name:'button2' }, output:{ io:'test1', name:'blah2' } },

    /*{ 
      input: { io:gamepad, name:'button3' }, 
      output:{ io:'test1', name:'blah3' },

      // expression is applied after affine transformation 
      expression: function(v) {
        return v * 1000
      }
    
    }*/
  ],
}