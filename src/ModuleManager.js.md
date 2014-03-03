IOManager
=========
The IOManager handles loading, verification, enumeration and disposal of IO objects.

**lo-dash** is our utility library of choice

    var _ = require('lodash')
		
    IM = module.exports = {
      

*defaults* is an array of module names that are loaded by default.

      defaults: [ 'hid' ],

The *loaded* array stores all IO objects that have been loaded by the IOManager			

      loaded: [],

Upon loading an IO object, the *verify* method is called on the object to ensure that it is valid. IO objects can have either inputs, outputs or both, but must have at least one.

      verify: function( io ) {
        var result = false
        if( typeof io === 'object' ) {
          if( io.inputs || io.outputs ) {
            result = true
          }
        }
        return result
      },
      
      load: function( ioName ) {
        var io
        
        try {
          io = require( ioName )
        }catch( e ) {
          console.log( 'module ' + ioName + ' not found.' )  
        }
        
        if( this.verify( io ) ) {
          io.init()
          this.loaded.push( ioName )
        }
      },
    }
