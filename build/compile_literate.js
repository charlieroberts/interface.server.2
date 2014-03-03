var fs = require( 'fs' ),
    _ = require( 'lodash' ),
    list;

list = [
  'ModuleManager', 
]

for( var i = 0; i < list.length; i++ ) {
  var file = fs.readFileSync( __dirname + '/../src/' + list[i]  + '.lit.js', 'utf8' ), 
      out  = file.match( / {4}.*/g )
  
  out = _.invoke( out, 'trim' )
      
  fs.writeFileSync( __dirname + '/../lib/' + list[i] + '.js', out.join('\n'), 'utf8' );
}