main.js
=======
    !function() {
      
    var _ = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        fs = require( 'fs'),
        parseArgs = require('minimist'),
        repl = require( 'repl' ),
        Types, IS2;

    IS2 = {
      ioManager: null,
      transportManager:   null,
      applicationManager: null,
      root: __dirname + '/',
      monitors: {},
      init: function() {
        this.__proto__ = new EE()
        this.__proto__.setMaxListeners( 0 )
        
        this.config = require( __dirname + '/../config.js' )
        
        var args = parseArgs( process.argv.slice(2) )
        
        _.assign( this.config, args )

        this.ioManager          = require( './IOManager.js' )( this ).init()
        this.transportManager   = require( './TransportManager.js' )( this ).init()
        this.applicationManager = require( './ApplicationManager.js' )( this ).init()
        this.switchboard        = require( './Switchboard.js' )( this ).init()
        Types = this.types      = require( './Types.js' )( this ).init()
        
        // shortcuts for connecting / disconnecting these make it /interface/handshake instead of /interface/applicationManager/handshake
        this.handshake = this.applicationManager.handshake
        this.disconnectApplication = this.applicationManager.removeApplicationWithName
        this.startMonitoring = function( device, name ) {
          if( ! IS2.monitors[ device ] ) IS2.monitors[ device ] = {}
          
          IS2.monitors[ device ][ name ] = function( v ) {
            console.log( "device " + device + " : " + name + " " + v )
          }
          
          IS2.ioManager.devices[ device ].on( name, IS2.monitors[ device ][ name ] )
        }
        
        this.stopMonitoring = function( device, name ) {
          try {
            IS2.ioManager.devices[ device ].removeListener( name, IS2.monitors[ device ][ name ] )
          }catch(e) {
            console.log( "Error removing monitoring: ", e)
          }
        }
        
        this.listDevices = function() {
          for( var key in IS2.ioManager.devices ) { console.log( key ) }
        }
        
        this.quit = function() {
          console.log( 'Now terminating...' )
          process.exit()
        }
        
        if( this.onload ) this.onload()
        
        repl.start({
          useGlobal:true,
          prompt: "interface.server > ",
          input: process.stdin,
          output: process.stdout
        });
        
        return this
      }
    }
    
    module.exports = IS2
     
    }()