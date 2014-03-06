var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
AM = module.exports = {
  applications: [],
  
  init: function( app ) {
    this.app = app
    
    this.__proto__ = new EE()
    
    this.on( 'new application', 
      function( application ) {
        if( AM.applications.indexOf( application ) === -1 ) {
          AM.applications.push( application )
        }
      }
    )
    return this
  },
  createApp: function( appString ) {
    eval( appString )
    
    var io = new this.app.ioManager.IO( { inputs:app.inputs, outputs:app.outputs } ),
        _destinations = [] 
    for( var i = 0; i < app.destinations.length; i++ ) {
      ( function() {
        var _destination = app.destinations[ i ], 
            targets      = _.where( io.inputs,  { destination: i } ),
            destination  = null
                      
        destination = this.app.transportManager.createDestination( _destination )
      
        if( destination !== null ) {
          _destinations.push( destination )
        
          _.forIn( targets, function( input, key ) {
            input.emit = function( _value ) {
              destination.output('/' + input.name , 'f', [ _value ] )
            }
          })
        }
      }.bind(this))()
    }
    
    
    app.destinations = _destinations
    io.name = app.name
    io.emit( 'new device', io.name, io )
    
    this.map( app.mappings )
    this.emit( 'new application', app )
  },
  map: function( mappings ) {
    _.forIn( mappings, function( mapping ) {
      var inputIO, outputIO, _in, _out, transform
      
      inputIO = this.app.ioManager.devices[ mapping.input.io ]
      outputIO = this.app.ioManager.devices[ mapping.output.io ]
      
      if( typeof inputIO === 'undefined' ) { throw 'ERROR: Input IO device ' + mapping.input.io + ' is not found.' }
      
      _in = inputIO.outputs[ mapping.input.name ]
      
      // if( typeof outputIO === 'undefined' ) {
      //   throw 'Output IO device ' + mapping.input.io + ' is not found.'
      // }
      
      _out = outputIO.inputs[ mapping.output.name ]
    
      transform = AM.createTransformFunction( _in, _out )
          
      inputIO.on( 
        mapping.input.name, 
        function( inputValue, previousInput ) {
          var output = transform( inputValue )
          
          // TODO: is only one of these needed?
          if( typeof this.expression === 'function' )    output = this.expression( output )
          if( typeof mapping.expression === 'function' ) output = mapping.expression( output )
          
          this.emit( output )
        }.bind( _out )
      )
    }, this )
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
  
  testApp: [
    "var app = {",
    "  name:'test',",
    "  destinations: [",
    "    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },",
    //"    { type:'WebSocket', ip:'127.0.0.1', port:9081 },",
    "    { type:'OSC', ip:'127.0.0.1', port:8081 }",        
    "  ],",
    "  inputs: {",
    "    blah:  { name:'blah', min: 200, max: 300, destination: 0, expression: function( v ) { return v * 4 } },",
    "    blah2: { name:'blah2', min: 0, max: 1, destination: 1 }",
    "  },",
    "  mappings: [",
    "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button1' }, output:{ io:'test', name:'blah'  }, expression: function( v ) { return v * .33 } },",
    "    { input: { io:'USB 2-Axis 8-Button Gamepad', name:'Button2' }, output:{ io:'test', name:'blah2' } }",
    "  ]",
    "}"
  ].join('\n'),
}