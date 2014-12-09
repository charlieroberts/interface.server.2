!function() {
  
var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, IS, fs = require( 'fs' )
IM = {
  app: null,
  //defaults: [ 'interface.server.gamepad', './keypress' ],
  loaded: [],
  
  devices: {},
  
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
  
  
  createDevice: function( description ) {
    var device = new IM.IO( description )
  }, 
  verify: function( io ) {
    var result = false
    
    if( typeof io === 'object' ) {
      if( /*( io.inputs || io.outputs ) &&*/ io.init ) {
        result = true
      }
    }
    
    return result
  },
  
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