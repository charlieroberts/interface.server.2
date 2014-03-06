ZeroMQ
======
By default, IS2 opens a ZeroMQ push service on port 10080. Applications can configure services to be opened on other ports
as they see fit. Messages sent from IS2 to clients come in as JSON strings in the form of
{ path:'/some/path/to/somewhere', values:[ 0,1,"stringy" ] }. You can test basic ZeroMQ functionality by running IS2 and then 
running the zeroMQ_test.js file found in the *tests* directory using node.

_ is our lo-dash reference; this object also relies on the node ws module: https://www.npmjs.org/package/ws.

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

*createServer* creates a new 0MQ push server to the provided port / ip address. Triggers the 'ZeroMQ server created' event.

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