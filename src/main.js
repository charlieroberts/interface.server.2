var _ = require( 'lodash' ), EE = require('events').EventEmitter, testApp, Types,
IS2 = {
  ioManager: null,
  transportManager:   null,
  applicationManager: null,
  root: __dirname + '/',
  init: function() {
    this.__proto__ = new EE()
    
    this.ioManager          = require( './io/IOManager.js' ).init( this )
    this.transportManager   = require( './transports/TransportManager.js' ).init( this )        
    this.applicationManager = require( './ApplicationManager.js' ).init( this )
    this.switchboard        = require( './Switchboard.js' ).init( this )
    Types = this.types      = require( './Types.js' ).init( this )
    
    setTimeout( function() {
      this.applicationManager.createApplicationWithText( testApp )
      this.switchboard.route( '/interface/applications/test/inputs/blah/min', 0 )
    }.bind(this), 1000 )
  }
}
    
testApp = [
  "var blah = 0, app = {",
  "  name:'test',",
  "  destinations: [",
  "    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },",
  "    { type:'WebSocket', ip:'127.0.0.1', port:9081 },",
  "    { type:'OSC', ip:'127.0.0.1', port:8082 }",        
  "  ],",
  "  inputs: {",
  "    blah:  { min: 200, max: 300, destinations: -1 },",
  "    blah2: { min: 0, max: 1, destinations: [1,2] },",
  "    blah3: { min: 2, max: 10, destinations: 2 },",      
  "  },",
  "  mappings: [",
  //"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, transform:false, output:{ io:'test', name:'blah'  }, expression: function( v ) { return v * .33 } },",
  //"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, expression: function(v) { blah = v } },",
  //"    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button3' }, output:{ io:'test', name:'blah3' }, expression: function(v) { return v * blah } },",      
  "  ]",
  "}"
].join('\n')

IS2.init()
global.IS2 = IS2

var q = [ .65,-.27,.65,.27 ]
console.log( "CONVERT", Types.convert( 'Quaternion', 'Euler', q ) )