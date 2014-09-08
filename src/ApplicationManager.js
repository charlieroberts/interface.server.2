!function() {
  
var _ = require( 'lodash' ), 
    EE = require( 'events' ).EventEmitter,
    IS,
AM = module.exports = {
  applications: {},
  
  init: function() {
        this.__proto__ = new EE()
    
    this.on( 'new application', 
      function( application ) {
        if( ! _.has( AM.applications, application.name  ) ) {
          AM.applications[ application.name ] = application
        }
      }
    )
    return this
  },
  createApplicationWithText: function( appString ) {
    var io, destinations, app
    
    eval( appString )
    app = new AM.Application( app )
    
 
    this.emit( 'new application', app )
  },
  
  createApplicationWithObject: function( obj ) {
    var app = new AM.Application( obj )

    this.emit( 'new application', app )
  },
  removeApplicationWithName : function( name ) {
    var app = AM.applications[ name ]
    app.emit( 'close' )
  },
  
  Application: function( properties) {
    _.assign( this, properties )
    
    this.initialProperties = properties
    
    this.io = new AM.app.ioManager.IO({ inputs:this.inputs, outputs:this.outputs, name: this.name })
    
    this.destinations = _.map( this.destinations, this.createDestination, this )
    this.mappings = _.map( this.mappings, this.createMapping, this )
  },
}

_.assign( AM.Application.prototype, {
  
        
  createDestination: function( _destination, key ) {
    var destination = AM.app.transportManager.createDestination( _destination )
  
    this.on( 'close', destination.close.bind( destination ) )
    
    return destination
  },
  
  createMapping: function( mapping, key ) {
    var inputIO, outputIO, _in, _out, transform, outputFunction, app = this, destinations
    
    inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
    
    if( typeof inputIO === 'undefined' ) { throw 'ERROR: Input IO device ' + mapping.input.io + ' is not found.' }
    
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
    
    if( mapping.output ) this.linkMappingOutputToDestinations( mapping, destinations )
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
    var destinations
    
    if( Array.isArray( mapping.outputControl.destinations) ) {
      destinations = []
      for( var i = 0; i < mapping.outputControl.destinations.length; i++ ) {
        destinations[ i ] = this.destinations[ mapping.outputControl.destinations[ i ] ]
      }
    }else{
      destinations = mapping.outputControl.destinations !== -1 ? [ this.destinations[ mapping.outputControl.destinations ] ] : this.destinations
    }
    
    for( var i = 0; i < destinations.length; i++ ) {
      ( function() {
        var destination = destinations[ i ]
    
        if( _.isObject( destination ) ) {
          mapping.outputControl.on( 'value', function( _value ) {
            destination.output( '/' + mapping.input.name , 'f', [ _value ] )
          })
        }else{
          throw 'A null destination was encountered';
        }
      })()
    }
  },
})

AM.Application.prototype.__proto__ = new EE()


module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } AM.app = IS; return AM; }

}()