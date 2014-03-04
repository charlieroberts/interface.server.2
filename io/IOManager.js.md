IOManager
=========
The IOManager handles loading, verification, enumeration and disposal of IO objects.

**lo-dash** is our utility library of choice

    var _ = require( 'lodash' )
		
    IM = module.exports = {
      app: null,

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
      
The *load* method attempts to find a given IO module and require it. If the module is found and verified, the modules *init* method is then called.

      load: function( ioName ) {
        var io
        
        if( _.contains( IM.loaded, ioName ) ) {
          console.log( 'module ' + ioName + ' is already loaded.' )
          return
        }
        
        //console.log(IM.app.root + 'io/' + ioName + '.js')
        try {
          io = require( IM.app.root + 'io/' + ioName + '.js' )
        }catch( e ) {
          console.log( 'module ' + ioName + ' not found.' )
          return
        }
        
        if( IM.verify( io ) ) {
          io.init( IM.app )
          IM.loaded.push( ioName )
        }
      },
      
The *init* function loads every io stored named in the *defaults* array. TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function( app ) {
        this.app = app
        
        _.forEach( this.defaults, this.load )
        
        return this
      },

*defaultIOProperties* are used whenever a new IO object is created to populate it with reasonable default properties. These
defaults can be overridden by passing a dictionary to the IO constructor.
      
      IO : function( props ) {
        _.assign( this, {
          inputs:  {},
          outputs: {},
        })
        
        _.assign( this, props )
      },
    }
    
    _.assign( IM.IO.prototype, {
      getInputNames:  function() { return _.keys( this.inputs ) },
      getOutputNames: function() { return _.keys( this.outputs ) },
    })