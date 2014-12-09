TransportManager
================
The TransportManager loads and manages abstractions for the various protocols that IS2 speaks, such
as OSC, MIDI and WebSockets.

**lo-dash** is our utility library of choice

    !function() {
    var _ = require( 'lodash' ),
        IS
		
    TM = {
      app: IS,

*defaults* is an array of transports that are loaded by default.

      defaults: [ 'OSC', 'WebSocket', 'ZeroMQ' ],

The *transports* dictionary stores all transports that have been loaded by the IOManager			

      transports: {},

Upon loading a transport, the *verify* method is called on the object to ensure that it is valid.
Transports must have methods for initialization, opening / closing, and sending / receiving.

      verify: function( transport, transportName ) {
        var result = false
        
        if( typeof transport === 'object' ) {
          if( ( transport.init ) ) {
            result = true
          }else{
            console.error( 'Transport ' + transportName + ' is not a valid transport module.' )
          }
        }
        
        return result
      },
      
The *load* method attempts to find a given IO module and require it. If the module is found and verified, the modules *init* method is then called.

      load: function( transportName ) {
        var transport
        
        if( _.has( TM.transports, transportName ) ) {
          console.log( 'Transport ' + transportName + ' is already loaded.' )
          return
        }
        
        // console.log("TRYING TO LOAD", 'interface.server.' + transportName )
        try {
          transport = require( 'interface.server.' + transportName )( IS )
        }catch( e ) {
          console.log( "ERROR", e )
          throw 'Transport ' + transportName + ' not found.'
          return
        }finally{
          console.log( 'Transport ' + transportName + ' is loaded.' )
        }
        
        if( TM.verify( transport, transportName ) ) {
          transport.init( TM.app )
          TM.transports[ transportName ] = transport
        }
      },
      
The *init* function loads every io stored named in the *defaults* array. TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function() {
        _.forEach( _.keys( IS.config.transports ), this.load )
        
        return this
      },
      
*createDestination* takes a dictionary argument and uses it to return some type of 
socket connection based on the value of the type property in dictionary. It abstracts the creation of
WebSocket / OSC / MIDI etc. connection.

      createDestination: function( properties ) {
        if( !_.has( this.transports, properties.type ) ) {
          throw 'Requested transport ' + properties.type + ' not found while creating destination'
        }

        var destination = null
        switch( properties.type ) {
          case 'osc':
            destination = this.transports[ 'osc' ].sender( properties.ip, properties.port )
            break;
          case 'websocket':
            destination = this.transports[ 'websocket' ].createServer( properties.port )
            break;
          case 'zeromq':
            destination = this.transports[ 'zeromq' ].createServer( properties.ip, properties.port )            
            break;
          default:
        }
        
        return destination
      },
    }
    
    module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } TM.app = IS; return TM; }
    
    }()