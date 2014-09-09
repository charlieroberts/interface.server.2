IOManager
=========
The IOManager handles loading, verification, enumeration and disposal of IO objects.

**lo-dash** is our utility library of choice
    !function() {
      
    var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, IS,
		
    IM = {
      app: null,

*defaults* is an array of module names that are loaded by default.

      defaults: [ 'interface.server.gamepad' ],

The *loaded* array stores the names all IO objects that have been loaded by the IOManager			

      loaded: [],
      
      devices: {},
      
The *init* function loads every io stored named in the *defaults* array. 
TODO: there should be some type of user preferences that decide which modules are loaded.

      init: function() {
        console.log(" INIT CALLED ON IOMANAGER ", this )
        this.__proto__ = new EE()
    
        _.forEach( this.defaults, this.load )
  
        this.on( 'new device', function( device ) {
          IM.devices[ device.name ] = device
          console.log( "NEW DEVICE", device.name )
        })
  
        return this
      },      

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
        var io, path, pathExists
        
        if( _.contains( IM.loaded, ioName ) ) {
          console.log( 'module ' + ioName + ' is already loaded.' )
          return
        }
        
        path = IM.app.root + 'io/' + ioName + '.js'
        pathExists = fs.existsSync( path )
        
        path = pathExists ? path : ioName
        
        try {
          io = require( path )
        }catch( e ) {
          console.log( 'module ' + ioName + ' not found.' )
          return
        }finally{
          console.log( 'module ' + ioName + ' is loaded.' )
        }
        
        if( IM.verify( io ) ) {
          io.init( IM.app )
                    
          io.on( 'new device', function( deviceName, device ) { IM.devices[ deviceName ] = device } )
          
          IM.loaded.push( ioName )
          
          //io.test()
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