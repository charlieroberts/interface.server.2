var _ = require( 'lodash' ), EE,
ZMQ = module.exports = {
  app: null,
  port: 10080, // TODO: this should be read in from defaults
  ip: 'tcp://127.0.0.1',
  clients: {},
  
  server: null,
  servers:{},
  
  init: function( app ) {
    console.log( '0MQ' )
    this.app = app      
    
    EE = require( 'events' ).EventEmitter
    this.__proto__ = new EE()
            
    this.on( 'ZeroMQ server created', function( server, port ) {
      ZMQ.servers[ port ] = server 
    })
  },
  createServer : function( ip, port ) {
    if( this.servers[ port ] ) return this.servers[ port ]
    
    var zmq = require( 'zmq' ),
        server = zmq.socket('push')
        
    server.bindSync( 'tcp://' + ip + ':' + port );
    
    server.clients = {}
    
    server.output = function( path, typetags, values ) { // TODO: you should be able to target individual clients
      this.send( JSON.stringify({ 'path': path, 'value':values }) )
    }
    
    ZMQ.servers[ port ] = server
    
    this.emit( 'ZeroMQ server created', server, port )
    
    return server
  },
}