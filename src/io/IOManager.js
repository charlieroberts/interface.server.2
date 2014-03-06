var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
IM = module.exports = {
  app: null,
  defaults: [ 'hid' ],
  loaded: [],
  
  devices: {},
  verify: function( io ) {
    var result = false
    
    if( typeof io === 'object' ) {
      if( ( io.inputs || io.outputs ) && io.init ) {
        result = true
      }
    }
    
    return result
  },
  
  load: function( ioName ) {
    var io
    
    if( _.contains( IM.loaded, ioName ) ) {
      console.log( 'module ' + ioName + ' is already loaded.' )
      return
    }
    
    try {
      io = require( IM.app.root + 'io/' + ioName + '.js' )
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
      
      io.test()
    }
  },
  
  init: function( app ) {
    this.app = app
    
    _.forEach( this.defaults, this.load )
    return this
  },
  
  IO : function( props, name ) {
    _.assign( this, {
      inputs:  {},
      outputs: {},
    })
    
    _.assign( this, props )
    
    this.__proto__ = new EE()
    
    this.on( 'new device', function( deviceName, device ) {
      IM.devices[ deviceName ] = device
      console.log( "NEW DEVICE", deviceName )
    })
    
    IM.loaded.push( name )
  },
}

_.assign( IM.IO.prototype, {
  getInputNames:  function() { return _.keys( this.inputs ) },
  getOutputNames: function() { return _.keys( this.outputs ) },
})