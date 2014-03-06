var _ = require( 'lodash' )
TM = module.exports = {
  app: null,
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
    
    //console.log( TM.app.root + 'transports/' + transportName + '.js ')
    
    try {
      transport = require( TM.app.root + 'transports/' + transportName + '.js' )
    }catch( e ) {
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
  
  init: function( app ) {
    this.app = app
    
    _.forEach( this.defaults, this.load )
    
    return this
  },
  
  createDestination: function( properties ) {
    if( !_.has( this.transports, properties.type ) ) {
      throw 'Requested transport ' + properties.type + ' not found while creating destination'
    }
    var destination = null
    switch( properties.type ) {
      case 'OSC':
        destination = this.transports[ 'OSC' ].sender( properties.ip, properties.port )
        break;
      case 'WebSocket':
        destination = this.transports[ 'WebSocket' ].createServer( properties.port )
        break;
      case 'ZeroMQ':
        destination = this.transports[ 'ZeroMQ' ].createServer( properties.ip, properties.port )            
        break;
      default:
    }
    
    return destination
  },
}