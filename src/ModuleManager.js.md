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
          if( ( io.inputs || io.outputs ) && io.init ) {
            result = true
          }
        }
        
        return result
      },
      
The *load* method attempts to find a given IO module and require it. If the module is found and verified, the module's *init* method is then called.

      load: function( ioName ) {
        var io
        
        if( _.contains( this.loaded, ioName ) {
          console.log( 'module ' + ioName + ' is already loaded.' )
          return
        }
        
        try {
          io = require( ioName )
        }catch( e ) {
          console.log( 'module ' + ioName + ' not found.' )
          return
        }
        
        if( this.verify( io ) ) {
          io.init()
          this.loaded.push( ioName )
        }
      },
      
The *init* function loads every io stored named in the *defaults* array. TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function() {
        _.forEach( this.defaults, this.load )
      },
    }
