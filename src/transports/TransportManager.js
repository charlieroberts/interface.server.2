!function() {
var _ = require( 'lodash' ),
    IS
TM = {
  app: IS,
  defaults: [ 'OSC', 'WebSocket', 'ZeroMQ' ],
  transports: {},
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
  
  init: function() {
    _.forEach( _.keys( IS.config.transports ), this.load )
    
    return this
  },
  
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