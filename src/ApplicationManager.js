!function() {
  
var _  = require( 'lodash' ), 
    EE = require( 'events' ).EventEmitter,
    fs = require( 'fs' ),
    IS,
AM = {
  applications: {},
  
  init: function() {
    this.__proto__ = new EE()
    
    this.on( 'new application', function( application ) {
        if( ! _.has( AM.applications, application.name ) ) {
          AM.applications[ application.name ] = application
        }
      }
    )
    
    if( 'application' in IS.config ) AM.loadApplicationWithName( IS.config.application )
    if( 'app' in IS.config ) AM.loadApplicationWithName( IS.config.app )
    return this
  },
  
  handshake: function( appName, ip ) {
    var app = AM.loadApplicationWithName( appName, ip )
    
    return app
  },
  
  connectApplication: function( spec, ip ) {
    
  },
  
  loadApplicationWithName: function( appName, ip ) {
    var path = IS.config.pathToApplications + '/' + appName + '.js',
        app  = require( path ),
        _app,
        hasMappings = 'mappings' in app
    
    delete require.cache[ path ] // remove so that handshake can easily reload interface
    
    app.ip = ip
    
    _app = this.createApplicationWithObject( app )
    
    if( !hasMappings ) {
      if( app.defaultImplementation ) {
        this.loadImplementationForAppWithName( appName, app.defaultImplementation )
      }
    }
    
    return _app
  },
  
  loadImplementationForAppWithName: function( appName, implementationName ) {
    var app = AM.applications[ appName ]
        mappingsDir = IS.config.pathToApplications + '/' + appName,
        dirExists = fs.existsSync( mappingsDir )
        
    if( dirExists ) {
      var mappingsPath = mappingsDir + '/' + implementationName,
          mappingsExists = fs.existsSync( mappingsPath )
      
      if( mappingsExists ) {
        var mappings = require( mappingsPath )
        
        this.assignMappingsToApplication( app.name, mappings )
      }
    }
    
    return app
  },
  
  assignMappingsToApplication: function( appName, mappings ) {
    var app = AM.applications[ appName ]
    
    app.mappings = _.map( mappings, app.createMapping, app )
  },
  createApplicationWithText: function( appString ) {
    var io, receivers, app
            
    eval( appString )
    
    app = new AM.Application( app )
 
    this.emit( 'new application', app )
    
    return app
  },
  
  createApplicationWithObject: function( obj ) {
    var app = new AM.Application( obj )

    this.emit( 'new application', app )
    
    return app
  },
  removeApplicationWithName : function( name ) {
    var app = AM.applications[ name ]
    app.emit( 'close' )
  },
  
  Application: function( properties) {
    _.assign( this, properties )
    
    this.initialProperties = properties
    
    this.io = new AM.app.ioManager.IO({ inputs:this.inputs, outputs:this.outputs, name: this.name })
    
    this.receivers = _.map( this.receivers, this.createDestination, this )
    
    if( this.mappings ) this.mappings = _.map( this.mappings, this.createMapping, this )
  },
}

_.assign( AM.Application.prototype, {
  
        
  createDestination: function( _destination, key ) {
    if( typeof _destination.ip === 'undefined' ) {
      // ip is assigned in loadApplicationWithName method of ApplicationManager
      _destination.ip = this.ip
    }
    var destination = AM.app.transportManager.createDestination( _destination )
  
    this.on( 'close', destination.close.bind( destination ) )
    
    return destination
  },
  
  createMapping: function( mapping ) {
    var inputIO, outputIO, _in, _out, transform, outputFunction, app = this, receivers
    
    inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
    
    if( typeof inputIO === 'undefined' ) { 
      console.log( 'ERROR: Input IO device ' + mapping.input.io + ' is not found. Cannot map ' + mapping.input.name + '.' )
      return
    }
    
    _in  = inputIO.outputs[ mapping.input.name ]
    
    if( mapping.output ) {
      outputIO = AM.app.ioManager.devices[ mapping.output.io ]
      
      _out = outputIO.inputs[ mapping.output.name ]
      _out.__proto__ = new EE()
      
      transform = this.createTransformFunction( _in, _out )
    
      outputFunction = this.createOutputFunctionForMapping( mapping ).bind( _out )
      
      mapping.outputControl = _out
      mapping.outputFunction = outputFunction
      mapping.transformFunction = transform
      mapping.transform = typeof mapping.transform !== 'undefined' ? mapping.transform : true
      
    }else if( mapping.expression ){
      outputFunction = function( inputValue) {
        return mapping.expression( inputValue )
      }
    }else{
      return 
    }
        
    inputIO.on( mapping.input.name, outputFunction )
    
    mapping.inputControl = _in
    
    if( mapping.output ) this.linkMappingOutputToDestinations( mapping, receivers )
    app.on( 'close', function() { inputIO.removeListener( mapping.input.name, outputFunction ) })  
    
    return mapping
  },
  
  
  
  createTransformFunction : function( _in, _out ) {        
    return function( value ) {
      var _in = this.inputControl, _out = this.outputControl, 
          inputRange = _in.max - _in.min,
          outputRange = _out.max - _out.min,
          valueAsPercent = ( value - _in.min ) * inputRange,
          output = outputRange * valueAsPercent
          
      output += _out.min
      
      return output
    }
  },
  
  createOutputFunctionForMapping : function( mapping ) {
    return function( inputValue, previousInput ) { // 'this' will be bound to output app input...
      var output = mapping.transform ? mapping.transformFunction( inputValue ) : inputValue
      
      // TODO: is only one of these needed?
      // if( typeof this.expression    === 'function' ) output = this.expression( output )
      if( typeof mapping.expression === 'function' ) output = mapping.expression( output )
      
      this.emit( 'value', output )
    }
  },
  
  linkMappingOutputToDestinations: function( mapping ) {
    var receivers
    if( Array.isArray( mapping.outputControl.receivers ) ) {
      receivers = []
      for( var i = 0; i < mapping.outputControl.receivers.length; i++ ) {
        receivers[ i ] = this.receivers[ mapping.outputControl.receivers[ i ] ]
      }
    }else{
      receivers = this.receivers.indexOf( mapping.outputControl.receivers ) > -1 ? [ this.receivers[ mapping.outputControl.receivers ] ] : this.receivers
    }

    for( var i = 0; i < receivers.length; i++ ) {
      ( function() {
        var destination = receivers[ i ]
        if( _.isObject( destination ) ) {
          mapping.outputControl.on( 'value', function( _value ) {
            if( _value instanceof Array){
              destination.output( '/' + mapping.output.name, Array(_value.length+1).join('f'), _value )
            }else{
              destination.output( '/' + mapping.output.name, 'f', [ _value ] )
            }
          })
        }else{
          throw 'A null destination was encountered';
        }
      })()
    }
  },
})

AM.Application.prototype.__proto__ = new EE()
module.exports = function( __IS ) { 
  if( typeof IS === 'undefined' ) { 
    IS = __IS; 
  }
  AM.app = IS; 
  
  return AM; 
}

}()