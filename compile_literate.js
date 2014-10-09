var fs = require( 'fs' ),
    _ = require( 'lodash' ),
    root =  __dirname + '/',
    files;

files = [
  'src/Interface.Server',
  
  'src/io/IOManager',
  'src/io/hid',
  'src/io/keypress',
  'src/io/mouse',  
  
  'src/transports/TransportManager',
  'src/transports/OSC',
  'src/transports/WebSocket',  
  'src/transports/ZeroMQ', 
   
  'src/ApplicationManager',
  'src/Switchboard',
  'src/Types',
  //'src/main',
]

for( var i = 0; i < files.length; i++ ) {
  var filename = files[ i ],
      file = fs.readFileSync( root + filename + '.js.md', 'utf8' ), 
      out  = file.match( /( {4})(.*)/g )
  
  out = _.invoke( out, 'slice', 4 )
  
  fs.writeFileSync( root + filename + '.js', out.join('\n'), 'utf8' );
}