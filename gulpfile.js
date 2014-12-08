var gulp  = require( 'gulp' ),
    watch = require( 'gulp-watch' ),
    _     = require( 'lodash' ),
    files;

gulp.task( 'watch', function(){
  gulp.watch( 'src/**/*.js.md', function( event ) { 
    var path = event.path    
        file = fs.readFileSync( path, 'utf8' ), 
        out  = file.match( /( {4})(.*)/g )
      
    out = _.invoke( out, 'slice', 4 )
      
    fs.writeFileSync( path.substring( 0, path.length - 3 ), out.join('\n'), 'utf8' );
  } )
});


gulp.task( 'default', [ 'watch' ] )