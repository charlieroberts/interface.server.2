var fs = require( 'fs' ),
    _ = require( 'lodash' ),
    root =  __dirname + '/',
    files;

files = [
  'io/IOManager',
  'io/hid',
  'transports/TransportManager',
  'transports/OSC',  
  'main',
]

for( var i = 0; i < files.length; i++ ) {
  var filename = files[ i ],
      file = fs.readFileSync( root + filename + '.js.md', 'utf8' ), 
      out  = file.match( / {4}.*/g )
      
  out = _.invoke( out, 'trim' )
  
  fs.writeFileSync( root + filename + '.js', out.join( '\n' ), 'utf8' );
}