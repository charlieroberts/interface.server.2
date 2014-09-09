// var gamepad = 'Logitech Dual Action #1'
var gamepad = 'Logitech RumblePad 2 USB #1'

module.exports = {
  name:'test1',
  destinations: [
    { type:'OSC', ip:'127.0.0.1', port:8080 },
  ],
  inputs: {
    blah:  { min: 200, max: 300, destination: 0 },
    blah2: { min: 0, max: 1, destination: 0 }    
  },
  mappings: [
    { input: { io:gamepad, name:'button1' }, expression: function(v) { console.log(v, v * 15) } },//output:{ io:'testapp', name:'blah' } },
    // { input: { io:gamepad, name:'Button1' }, output:{ io:'testapp', name:'blah2' } }
  ]
}