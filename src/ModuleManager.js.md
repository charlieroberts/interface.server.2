IOManager
=========
The IOManager handles loading, verification, enumeration and disposal of IO objects.

**lo-dash** is our utility library of choice

    var _ = require('lodash')
		
    IM = module.exports = {
    
The loaded array stores all IO objects that have been created loaded by the IOManager			

      loaded: [],

Upon loading an IO object, the *verify* method is called on the object to ensure that it is valid

      verify: function( io ) {
        var result = false
        if( typeof io === 'object' ) {
        
IO objects can have either inputs, outputs or both, but must have at least one.

          if( io.inputs || io.outputs ) {
            result = true
          }
        }
        return result
      }
    }
