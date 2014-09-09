main.js
=======
    !function() {
      
    var _ = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        fs = require( 'fs'),
        parseArgs = require('minimist'),
        Types, IS2;

    IS2 = {
      ioManager: null,
      transportManager:   null,
      applicationManager: null,
      root: __dirname + '/',
      init: function() {
        this.__proto__ = new EE()

        this.ioManager          = require( './io/IOManager.js' )( this ).init()
        this.transportManager   = require( './transports/TransportManager.js' )( this ).init()
        this.applicationManager = require( './ApplicationManager.js' )( this ).init()
        this.switchboard        = require( './Switchboard.js' )( this ).init()
        Types = this.types      = require( './Types.js' )( this ).init()
        
        this.config             = require( __dirname + '/../config.js' )
        
        var args = parseArgs( process.argv.slice(2) )
        
        _.assign( this.config, args )
        // setTimeout( function() {
        //   this.applicationManager.createApplicationWithObject( testApp )
        //   this.switchboard.route( '/interface/applications/test/inputs/blah/min', 0 )
        // }.bind(this), 1000 )
        
        if( this.onload ) this.onload()
        
        return this
      }
    }

// *testApp* is a dummy app string to use for testing purposes
// 
//     testApp = [
//       "var blah = 0, app = {",
//       "  name:'test',",
//       "  destinations: [",
//       "    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },",
//       "    { type:'WebSocket', ip:'127.0.0.1', port:9081 },",
//       "    { type:'OSC', ip:'127.0.0.1', port:8082 }",        
//       "  ],",
//       "  inputs: {",
//       "    blah:  { min: 200, max: 300, destinations: -1 },",
//       "    blah2: { min: 0, max: 1, destinations: [1,2] },",
//       "    blah3: { min: 2, max: 10, destinations: 2 },",      
//       "  },",
//       "  mappings: [",
//       "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, transform:false, output:{ io:'test', name:'blah'  }, expression: function( v ) { return v * .33 } },",
//       "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, expression: function(v) { blah = v } },",
//       "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button3' }, output:{ io:'test', name:'blah3' }, expression: function(v) { return v * blah } },",      
//       "  ]",
//       "}"
//     ].join('\n')
   
//     IS2.init()
    module.exports = IS2
     
    }()
    
// var q = [ .65,-.27,.65,.27 ]
// console.log( "CONVERT", Types.convert( 'Quaternion', 'Euler', q ) )
