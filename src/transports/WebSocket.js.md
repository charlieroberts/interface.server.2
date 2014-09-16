WebSocket
=========
By default, IS2 opens a WebSocket on port 9080. Applications can configure sockets to be opened on other ports
as they see fit. Messages sent from IS2 to clients come in the form { path:'/some/path/to/somewhere', values:[ 0,1,"stringy" ] }.
You can test basic WebSocket functionality by running IS2 and then opening the webSocketTest.htm file found in the *tests* directory.

_ is our lo-dash reference; this object also relies on the node ws module: https://www.npmjs.org/package/ws.
    !function() {
      
    var _ = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        IS
		
    WS = {
      app: null,
      port: 9080, // TODO: this should be read in from defaults
      clients: {},
      
      server: null,
      servers:{},
      
      init: function() {     
        this.__proto__ = new EE()
        
        this.server = this.createServer( IS.config.remotePortWebSocket )
        
        this.on( 'WebSocket server created', function( server, port ) {
          WS.servers[ port ] = server 
        })
      },

*createServer* creates a new WebSocket server listening on the provided port argument. Triggers the 'WebSocket server created' event.

      createServer : function( port ) {
        if( this.servers[ port ] ) return this.servers[ port ]
        
        var server = new ( require( 'ws' ).Server )({ 'port': port })
        
        //server.clients = {} // TODO: this is already an array defined by the ws module.
        
        server.on( 'connection', this.onClientConnection.bind( server ) )
        
        server.output = function( path, typetags, values ) { // TODO: you should be able to target individual clients
          for( var i = 0; i < server.clients.length; i++ ) {
            var client = server.clients[ i ]
            client.send( JSON.stringify({ 'key': path, 'values': Array.isArray( values ) ? values : [ values ] }) )
          }
        }
        
        WS.servers[ port ] = server
        
        this.emit( 'WebSocket server created', server, port )
        
        return server
      },
      
      onClientConnection : function( client ) { // "this" is bound to a ws server
        client.ip = client._socket.remoteAddress;
        this.clients[ client.ip ] = WS.clients[ client.ip ] = client
        
        client.on( 'message', function( msg ) {
          msg = JSON.parse( msg )
          msg.values.unshift( msg.key ) // switchboard.route accepts one array argument with path at beginning
          var response = WS.app.switchboard.route.apply( WS.app.switchboard, msg.values )
          if( response !== null ) {
            client.send( JSON.stringify({ 'key': msg.path, 'values':[ response ] }) )
          }
        })
        
        client.on( 'close', function() {
          delete WS.clients[ client.ip ]
          WS.emit( 'WebSocket client closed', client.ip )
        })
        
        WS.emit( 'WebSocket client opened', client.ip )
      },

*close* Close a socket using an optional name argument. If no name argument is provided, all
existing OSC sockets are closed.
      
      
      close: function( name ) {
        if( name ) {
          this.receivers[ name ].close()
          delete this.receivers[ name ]
        }else{
          _.forIn( this.receivers, function( recv ) {
            recv.close()
          })
          this.receivers = {}
        }
      },
    }
    
    module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } WS.app = IS; return WS; }
    
    }()