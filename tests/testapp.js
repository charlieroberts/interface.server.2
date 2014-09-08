var gamepad = 'Logitech RumblePad 2 USB'

module.exports = {
  name:'testapp',
  destinations: [
    { type:'OSC', ip:'127.0.0.1', port:8080 },
  ],
  inputs: {
    blah:  { min: 200, max: 300, destination: 0 },
    blah2: { min: 0, max: 1, destination: 0 }    
  },
  mappings: [
    // { input: { io:gamepad, name:'Button1' }, expression: function(v) {console.log(v) } },//output:{ io:'testapp', name:'blah' } },
    // { input: { io:gamepad, name:'Button1' }, output:{ io:'testapp', name:'blah2' } }
  ]
}