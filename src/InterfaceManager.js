var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
IM = module.exports = {
interfaces: [],

init: function( app ) {
console.log( 'IM INIT' )
this.app = app

return this
},

testApp: [
"var _app = {",
"  name:'test',",
"  destinations: [",
"    { type:'OSC', ip:'127.0.0.1', port:8080 }",
"  ],",
"  inputs: {",
"    blah:  { name:'blah', min: 200, max: 300, destination: 0 },",
"    blah2: { name:'blah2', min: 0, max: 1, destination: 0 }    ",
"  },",
"  mappings: [",
"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, output:{ io:'test', name:'blah'  } },",
"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, output:{ io:'test', name:'blah2' } }",
"  ]",
"}"
].join('\n'),

createApp: function() {
eval( this.testApp )
var io = new this.app.ioManager.IO( { inputs:_app.inputs, outputs:_app.outputs } ),
app = { destinations:[] }

for( var i = 0; i < _app.destinations.length; i++ ) {
var _destination = _app.destinations[ i ], destination,
targets = _.filter( io.inputs, function( input ) { return input.destination === i } )

destination = _destination.type === 'OSC' ? this.app.transportManager.loaded.OSC.sender( _destination.ip, _destination.port ): null
app.destinations.push( destination )

if( destination !== null ) {
_.forIn( targets, function( input, key ) {
console.log( 'DESTINATION RESULT', input, key )
input.emit = function( _value ) {
destination.send('/' + input.name , 'f', [_value] )
}
})
}
}

io.name = _app.name

io.emit( 'new device', io.name, io )

this.createInterface( _app.mappings )
},

createInterface: function( mappings ) {
_.forIn( mappings, function( mapping ) {
//console.log( mapping.input.io, this.app.ioManager.devices )
var inputIO = this.app.ioManager.devices[ mapping.input.io ],
outputIO = this.app.ioManager.devices[ mapping.output.io ],
_in, _out, transform

console.log( outputIO )
_in = inputIO.outputs[ mapping.input.name ]
//console.log( mapping.output.io )
_out = outputIO.inputs[ mapping.output.name ]
transform = ( function() {
var inputMin = _in.min,
inputMax = _in.max,
inputRange = _in.max - _in.min,
outputMin = _out.min,
outputMax = _out.max,
outputRange = _out.max - _out.min

return function( value ) {
var valueAsPercent = ( value - inputMin ) * inputRange,
output = outputRange * valueAsPercent

output += outputMin

return output
}
})()

inputIO.on(
mapping.input.name,
function( value, previous ) {
_out.emit( transform( value ) )
}
)
}, this )
},

}