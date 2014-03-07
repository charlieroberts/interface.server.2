var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
AM = module.exports = {
  applications: [],
  
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
    
    console.log( this.createDestination )
    this.initialProperties = properties
    
    this.io = new AM.app.ioManager.IO({ inputs:this.inputs, outputs:this.outputs, name: this.name })
    
    this.destinations = _.map( this.destinations, this.createDestination, this )
    
    this.mappings = _.forIn( this.mappings, this.createMapping, this )
  },
}

_.assign( AM.Application.prototype, {
  
        
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
  
  createMapping: function( mapping ) {
    var inputIO, outputIO, _in, _out, transform, outputFunction, app = this
    inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
    outputIO = AM.app.ioManager.devices[ mapping.output.io ]
    
    if( typeof inputIO === 'undefined' ) { throw 'ERROR: Input IO device ' + mapping.input.io + ' is not found.' }
    
    _in  = inputIO.outputs[ mapping.input.name  ]
    _out = outputIO.inputs[ mapping.output.name ]
  
    transform = this.createTransformFunction( _in, _out )
    
    outputFunction = this.createOutputFunction( mapping, transform ).bind( _out )
        
    inputIO.on( mapping.input.name, outputFunction )
    mapping.input = inputIO
    
    app.on( 'close', function() { inputIO.removeListener( mapping.input.name, outputFunction ) })  
  },
  
  
  
  createTransformFunction : function( _in, _out ) {
    var inputMin = _in.min,
        inputMax = _in.max,
        inputRange = _in.max - _in.min,
        outputMin = _out.min,
        outputMax = _out.max,
        outputRange = _out.max - _out.min
    
    return function( value ) {
      var valueAsPercent = ( value - inputMin ) * inputRange,
          output = outputRange * valueAsPercent
          
      output += outputMin
      
      return output
    } 
  },
  
  createOutputFunction : function( mapping, transform ) {
    return function( inputValue, previousInput ) { // 'this' will be bound to output app input...
      var output = transform( inputValue )
      
      // TODO: is only one of these needed?
      if( typeof this.expression    === 'function' ) output = this.expression( output )
      if( typeof mapping.expression === 'function' ) output = mapping.expression( output )
      
      this.emit( output )
    }
  },
})

AM.Application.prototype.__proto__ = new EE()
