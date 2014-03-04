var fs = require( 'fs' ),
    _ = require( 'lodash' ),
    root =  __dirname + '/../',
    list;

list = [
  'src/ModuleManager',
  'modules/hid',
  'main',
]

for( var i = 0; i < list.length; i++ ) {
  var file = fs.readFileSync( root + list[i]  + '.js.md', 'utf8' ), 
      out  = file.match( / {4}.*/g ),
      filename = list[ i ].split( '/' )[1] || list[ i ]
  
  out = _.invoke( out, 'trim' )
  
  fs.writeFileSync( root + 'lib/' + filename + '.js', out.join('\n'), 'utf8' );
}