!function( IS ) {
  
var _ = require( 'lodash' ), 
    EE = require( 'events' ).EventEmitter,
    zmq = require( 'zmq' ),
    server = zmq.socket('push'),
ZMQ = {
  app: null,
  port: 10080, // TODO: this should be read in from defaults
  ip: 'tcp://127.0.0.1',
  clients: {},
  
  server: null,
  servers:{},
  
  init: function( app ) {
    this.__proto__ = new EE()
    this.__proto__.setMaxListeners( 0 )
    
    this.on( 'ZeroMQ server created', function( server, port ) {
      ZMQ.servers[ port ] = server 
    })
  },
  createServer : function( ip, port ) {
    if( this.servers[ port ] ) return this.servers[ port ]
        
    server.bindSync( 'tcp://' + ip + ':' + port );
    
    server.clients = {}
    
    server.output = function( path, typetags, values ) { // TODO: you should be able to target individual clients
      this.send( JSON.stringify({ 'key': path, 'values':values }) )
    }
    
    ZMQ.servers[ port ] = server
    
    this.emit( 'ZeroMQ server created', server, port )
    
    return server
  },
}

module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } ZMQ.app = IS; return ZMQ; }

}()