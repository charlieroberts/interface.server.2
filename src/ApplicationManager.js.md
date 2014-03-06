ApplicationManager
================
The *ApplicationManager* object handles the creation of *applications*, which are essentially collections of
*mappings* between input and output *IO* objects along with destinations defining where the application receives
input messages. 

_ is our lo-dash reference, while HID refers to the node HID module, https://www.npmjs.org/package/node-hid.

    var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter,
		
    AM = module.exports = {

*interfaces* is an dictionary of all currently running interfaces in Interface.Server.

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

*createApp* is used to generate an application (a set of inputs that with mappings and associated destinations) from a provided
JavaScript string.
  
      createApp: function( appString ) {
        var io, destinations
        
        eval( appString )
        
        app.__proto__ = new EE()
        
        app.io = new this.app.ioManager.IO({ inputs:app.inputs, outputs:app.outputs, name: app.name })

After generating the appropriate destinations for the application we replace the descriptors used to generate the
destination objects with destinations themselves.
        
        app.destinations = this.createDestinationsForApp( app )

Generate mappings for the application.
        
        _.forIn( app.mappings, function( mapping ) { AM.createMappingForApp( mapping, app ) } )
        
Emit an event telling the ApplicationManager listeners that a new application has been created.        
        this.emit( 'new application', app )
      },
      
Go through all the destinations defined for the app and create them. Find all app inputs that use each 
destination and bind their emit function to generate output using the *output* method of the destination.      

      createDestinationsForApp: function( app ) {
        var destinations = []
        for( var i = 0; i < app.destinations.length; i++ ) {
          ( function() {
            var _destination = app.destinations[ i ], 
                targets      = _.where( app.io.inputs,  { destination: i } ),
                destination  = null
                          
            destination = AM.app.transportManager.createDestination( _destination )
          
            if( destination !== null ) {
              destinations.push( destination )
            
              _.forIn( targets, function( input, key ) {
                input.emit = function( _value ) {
                  destination.output('/' + input.name , 'f', [ _value ] )
                }
              })
            }
            
            app.on( 'close', destination.close.bind( destination ) )
          })()
        }
        
        return destinations
      },

*createMappingForApp* : Lookup the input and output device members and create a function that serves as an affine transform
between the input range and the output range. Add a listener to the input object that sends a message to the output destination 
whenever the input signal changes.
      
      createMappingForApp: function( mapping, app ) {
        var inputIO, outputIO, _in, _out, transform, outputFunction

        inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
        outputIO = AM.app.ioManager.devices[ mapping.output.io ]
        
        if( typeof inputIO === 'undefined' ) { throw 'ERROR: Input IO device ' + mapping.input.io + ' is not found.' }
        
        _in  = inputIO.outputs[ mapping.input.name  ]
        _out = outputIO.inputs[ mapping.output.name ]
      
        transform = AM.createTransformFunction( _in, _out )
        
        outputFunction = AM.createOutputFunction( mapping, transform ).bind( _out )
            
        inputIO.on( mapping.input.name, outputFunction )
        mapping.input = inputIO
        
        app.on( 'close', function() { inputIO.removeListener( mapping.input.name, outputFunction ) })  
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
      
      removeApplicationWithName : function( name ) {
        var app = AM.applications[ name ]
        app.emit( 'close' )
      },
      
*testApp* is a dummy app string to use for testing purposes

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