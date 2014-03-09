var _ = require( 'lodash' ), EE = require('events').EventEmitter, testApp,
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
    
    
    setTimeout( function() {
      this.applicationManager.createApplicationWithText( testApp )
      //'/interface/changeMappingPropertyForApplication': function( applicationName, mappingName, propertyName, newValue ) {
      //this.switchboard[ '/interface/changeInputPropertyForApplication' ]( 'test', 'blah', 'min', 0 )
      
      this.switchboard.route( '/interface/applications/test/inputs/blah/min', 0 )
    }.bind(this), 1000 )
  }
}
    
testApp = [
  "var app = {",
  "  name:'test',",
  "  destinations: [",
  //"    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },",
  "    { type:'WebSocket', ip:'127.0.0.1', port:9081 },",
  "    { type:'OSC', ip:'127.0.0.1', port:8081 }",        
  "  ],",
  "  inputs: {",
  "    blah:  { name:'blah', min: 200, max: 300, destination: 1, expression: function( v ) { return v * 4 } },",
  "    blah2: { name:'blah2', min: 0, max: 1, destination: 1 }",
  "  },",
  "  mappings: [",
  "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, output:{ io:'test', name:'blah'  }, expression: function( v ) { return v * .33 } },",
  "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, output:{ io:'test', name:'blah2' } }",
  "  ]",
  "}"
].join('\n')

IS2.init()
global.IS2 = IS2