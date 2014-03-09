var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
AM = module.exports = {
  applications: {},
  
  init: function( app ) {
    this.app = app
    
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
    var io, destinations
    
    eval( appString )
    app = new AM.Application( app )
    
 
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
    
    //_.each( this.inputs, this.gettersAndSetters, this )
  },
}

_.assign( AM.Application.prototype, {
  gettersAndSetters: function( input, key ) {
    var _min = input.min, _max = input.max, _expression = input.expression, app = this, mapping
    
    for( var i = 0; i < app.mappings.length; i++ ) {
      var _mapping = app.mappings[ i ]
      if( _mapping.output.name === key ) {
        mapping = _mapping
    
        break;
      }
    }
    Object.defineProperties( input, {
      min: {
        get: function() { return _min },
        set: function(v) { _min = v; } 
      },
      max: {
        get: function() { return _max },
        set: function(v) { _max = v; }
      },
      
    })
  },
  
        
  createDestination: function( _destination ) {
    var targets      = _.where( this.io.inputs,  { destination: 1 } ),
        destination = AM.app.transportManager.createDestination( _destination )
        
    if( destination !== null ) {      
      _.forIn( targets, function( input, key ) {
        input.emit = function( _value ) {
          destination.output('/' + input.name , 'f', [ _value ] )
        }
      })
    }else{
      throw 'A null destination was encountered';
    }
  
    this.on( 'close', destination.close.bind( destination ) )
    
    return destination
  },
  
  createMapping: function( mapping, key ) {
    var inputIO, outputIO, _in, _out, transform, outputFunction, app = this
    
    console.log( "MIO", mapping.input.io )
    //inputIO  = typeof mapping.input.io === 'string' ? AM.app.ioManager.devices[ mapping.input.io ] : mapping.input
    inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
    outputIO = AM.app.ioManager.devices[ mapping.output.io ]
    
    if( typeof inputIO === 'undefined' ) { throw 'ERROR: Input IO device ' + mapping.input.io + ' is not found.' }
    
    _in  = inputIO.outputs[ mapping.input.name  ]
    _out = outputIO.inputs[ mapping.output.name ]
  
    transform = this.createTransformFunction( _in, _out )
    
    outputFunction = this.createOutputFunction( mapping ).bind( _out )
        
    inputIO.on( mapping.input.name, outputFunction )
    mapping.inputControl = _in
    mapping.outputControl = _out
    mapping.outputFunction = outputFunction
    mapping.transform = transform
    
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
  
  createOutputFunction : function( mapping ) {
    return function( inputValue, previousInput ) { // 'this' will be bound to output app input...
      var output = mapping.transform( inputValue )
      
      // TODO: is only one of these needed?
      if( typeof this.expression    === 'function' ) output = this.expression( output )
      if( typeof mapping.expression === 'function' ) output = mapping.expression( output )
      
      this.emit( output )
    }
  },
})

AM.Application.prototype.__proto__ = new EE()
