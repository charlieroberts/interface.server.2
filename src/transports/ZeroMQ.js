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

this.server = this.createServer( '127.0.0.1', 9080 )

this.on( 'ZeroMQ server created', function( server, port ) {
ZMQ.servers[ port ] = server
})
},
createServer : function( ip, port ) {
if( this.servers[ port ] ) return this.servers[ port ]

var zmq = require( 'zmq' ),
server = zmq.socket('push')

server.bindSync( 'tcp://' + ip + ':' + port );

server.clients = {} // TODO: this is already an array defined by the ws module.

//server.on( 'connection', this.onClientConnection.bind( server ) )

server.output = function( path, typetags, values ) { // TODO: you should be able to target individual clients
this.send( JSON.stringify({ 'path': path, 'value':values }) )
}

ZMQ.servers[ port ] = server

this.emit( 'ZeroMQ server created', server, port )

return server
},

onClientConnection : function( client ) { // "this" is bound to a ws server
client.ip = client._socket.remoteAddress;
this.clients[ client.ip ] = WS.clients[ client.ip ] = client

client.on( 'message', function( msg ) {
console.log( 'ZMQ MSG:', msg )
client.send( JSON.stringify( { handshake: true } ) )
})

client.on( 'close', function() {
delete WS.clients[ client.ip ]
WS.emit( 'ZeroMQ client closed', client.ip )
})

WS.emit( 'ZeroMQ client opened', client.ip )
},


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