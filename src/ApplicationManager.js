var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
IM = module.exports = {
applications: [],

init: function( app ) {
this.app = app

this.__proto__ = new EE()

this.on( 'new application',
function( application ) {
if( IM.applications.indexOf( application ) === -1 ) {
IM.applications.push( application )
}
}
)
return this
},
createApp: function( appString ) {
eval( appString )

var io = new this.app.ioManager.IO( { inputs:app.inputs, outputs:app.outputs } ),
_destinations = []
for( var i = 0; i < app.destinations.length; i++ ) {
( function() {
var _destination = app.destinations[ i ],
targets      = _.where( io.inputs,  { destination: i } ),
destination  = null

destination = this.app.transportManager.createDestination( _destination )

if( destination !== null ) {
_destinations.push( destination )

_.forIn( targets, function( input, key ) {
input.emit = function( _value ) {
destination.send('/' + input.name , 'f', [ _value ] )
}
})
}
}.bind(this))()
}


app.destinations = _destinations
io.name = app.name
io.emit( 'new device', io.name, io )

this.map( app.mappings )
this.emit( 'new application', app )
},
map: function( mappings ) {
_.forIn( mappings, function( mapping ) {
var inputIO = this.app.ioManager.devices[ mapping.input.io ],
outputIO = this.app.ioManager.devices[ mapping.output.io ],
_in = inputIO.outputs[ mapping.input.name ],
_out = outputIO.inputs[ mapping.output.name ],
transform

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

testApp: [
"var app = {",
"  name:'test',",
"  destinations: [",
"    { type:'OSC', ip:'127.0.0.1', port:8080 },",
"    { type:'OSC', ip:'127.0.0.1', port:8081 }",
"  ],",
"  inputs: {",
"    blah:  { name:'blah', min: 200, max: 300, destination: 0 },",
"    blah2: { name:'blah2', min: 0, max: 1, destination: 1 }    ",
"  },",
"  mappings: [",
"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, output:{ io:'test', name:'blah'  } },",
"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, output:{ io:'test', name:'blah2' } }",
"  ]",
"}"
].join('\n'),
}