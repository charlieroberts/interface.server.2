IOManager
=========
The IOManager handles loading, verification, enumeration and disposal of IO objects.

**lo-dash** is our utility library of choice
    !function() {
      
    var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, IS, fs = require( 'fs' )
		
    IM = {
      app: null,

*defaults* is an array of module names that are loaded by default. TODO: read from config.js instead

      //defaults: [ 'interface.server.gamepad', './keypress' ],

The *loaded* array stores the names all IO objects that have been loaded by the IOManager			

      loaded: [],
      
      devices: {},
      
The *init* function loads every io stored named in the *defaults* array. 
TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function() {
        //console.log( "INIT CALLED ON IOMANAGER" )
        
        this.__proto__ = new EE()
        this.__proto__.setMaxListeners( 0 )
    
        //_.forEach( this.defaults, this.load )
        _.forEach( _.keys( IS.config.IO ), this.load )
        
        this.on( 'new device', function( device ) {
          IM.devices[ device.name ] = device
          console.log( 'NEW DEVICE', device.name )
        })
  
        return this
      },      

*createDevice* enables dynamic device creation over the network      
      
      createDevice: function( description ) {
        var device = new IM.IO( description )
      }, 
Upon loading an IO object, the *verify* method is called on the object to ensure that it is valid. IO objects can have either inputs, outputs or both, but must have at least one.

      verify: function( io ) {
        var result = false
        
        if( typeof io === 'object' ) {
          if( /*( io.inputs || io.outputs ) &&*/ io.init ) {
            result = true
          }
        }
        
        return result
      },
      
The *load* method attempts to find a given IO module and require it. If the module is found and verified, the modules *init* method is then called.

      load: function( ioName ) {
        var io, path, pathExists
        
        if( _.contains( IM.loaded, ioName ) ) {
          console.log( 'module ' + ioName + ' is already loaded.' )
          return
        }
        
        path = ioName
        
        try {
          io = require( 'interface.server.' + path )
        }catch( e ) {
          console.log( e )
          console.log( 'module ' + ioName + ' not found.' )
          throw e
        }finally{
          console.log( 'module ' + ioName + ' is loaded.' )
        }
        
        if( IM.verify( io ) ) {
          
          io.on( 'new device', function( deviceName, device ) { 
            console.log( "NEW ", deviceName )
            IM.devices[ deviceName ] = device 
          })
          
          io.init( IM.app )  

          IM.loaded.push( ioName )
        }
      },

*defaultIOProperties* are used whenever a new IO object is created to populate it with reasonable default properties. These
defaults can be overridden by passing a dictionary to the IO constructor.
      
      IO : function( props ) {
        _.assign( this, {
          inputs:  {},
          outputs: {},
        })
        
        _.assign( this, props )
        
        this.__proto__ = new EE()
        
        IM.emit( 'new device', this )
        IM.loaded.push( this.name )
      },
    }
    
    _.assign( IM.IO.prototype, {
      getInputNames:  function() { return _.keys( this.inputs ) },
      getOutputNames: function() { return _.keys( this.outputs ) },
    })
    
    module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } IM.app = IS; return IM; }
    
    }()