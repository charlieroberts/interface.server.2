var zmq = require( 'zmq' ),
    sock = zmq.socket( 'pull' );

sock.connect( 'tcp://127.0.0.1:10080' )
console.log( 'Worker connected to port 10080' )

sock.on( 'message', function( msg ){
  console.log( 'work: %s', msg.toString() )
})