var fs = require( 'fs' ),
    _ = require( 'lodash' ),
    root =  __dirname + '/',
    list;

list = [
  'io/IOManager',
  'io/hid',
  'main',
]

for( var i = 0; i < list.length; i++ ) {
  var file = fs.readFileSync( root + list[i]  + '.js.md', 'utf8' ), 
      out  = file.match( / {4}.*/g ),
      filename = list[ i ]
  
  out = _.invoke( out, 'trim' )
  
  fs.writeFileSync( root + filename + '.js', out.join('\n'), 'utf8' );
}