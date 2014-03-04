TransportManager
=========
The TransportManager loads and manages abstractions for the various protocols that IS2 speaks, such
as OSC, MIDI and WebSockets.

**lo-dash** is our utility library of choice

    var _
		
    TM = module.exports = {
      app: null,

*defaults* is an array of transports that are loaded by default.

      defaults: [ 'OSC' ],

The *loaded* array stores all transports that have been loaded by the IOManager			

      loaded: [],

Upon loading a transport, the *verify* method is called on the object to ensure that it is valid.
Transports must have methods for initialization, opening / closing, and sending / receiving.

      verify: function( transport, transportName ) {
        var result = false
        
        if( typeof transport === 'object' ) {
          if( ( transport.init && transport.open && transport.close && transport.send && transport.receive ) ) {
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
        
        if( _.contains( TM.loaded, transportName ) ) {
          console.log( 'Transport ' + transportName + ' is already loaded.' )
          return
        }
        
        try {
          transport = require( IM.app.root + 'transports/' + transportName + '.js' )
        }catch( e ) {
          console.log( 'Transport ' + transportName + ' not found.' )
          return
        }
        
        if( TM.verify( transport, transportName ) ) {
          transport.init( IM.app )
          TM.loaded.push( transportName )
        }
      },
      
The *init* function loads every io stored named in the *defaults* array. TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function( app ) {
        this.app = app
        _ = this.app.packages.lodash
        
        _.forEach( this.defaults, this.load )
        
        return this
      },
    }
