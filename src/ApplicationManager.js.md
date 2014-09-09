ApplicationManager
==================
The *ApplicationManager* object handles the creation of *applications*, which are essentially collections of
*mappings* between input and output *IO* objects along with receivers defining where the application receives
input messages. 

    !function() {
      
    var _  = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        fs = require( 'fs' )
        IS,
		
    AM = module.exports = {

*interfaces* is an dictionary of all currently running interfaces in Interface.Server.

      applications: {},
      
      init: function() {
        this.__proto__ = new EE()
        
        this.on( 'new application', function( application ) {
            if( ! _.has( AM.applications, application.name ) ) {
              AM.applications[ application.name ] = application
            }
          }
        )

        return this
      },
      
      loadApplicationWithName: function( appName ) {
        var path = IS.config.pathToApplications + '/' + appName + '.js',
            app  = require( path ),
            hasMappings = 'mappings' in app
        
        this.createApplicationWithObject( app )
        
        if( !hasMappings ) {
          if( app.defaultImplementation ) {
            this.loadImplementationForAppWithName( appName, app.defaultImplementation )
          }
        }
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
      },
      
      assignMappingsToApplication: function( appName, mappings ) {
        var app = AM.applications[ appName ]
        
        app.mappings = _.map( mappings, app.createMapping, app )
      },

*createApp* is used to generate an application (a set of inputs that with mappings and associated receivers) from a provided
JavaScript string. Useful when app data is transmitted over a network
  
      createApplicationWithText: function( appString ) {
        var io, receivers, app
        
        eval( appString )

        app = new AM.Application( app )
        
Emit an event telling the ApplicationManager listeners that a new application has been created.
     
        this.emit( 'new application', app )
      },
      
*createAppplicationWithObj* is used to generate an application (a set of inputs that with mappings and associated receivers) from a provided
JavaScript object.
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
        
        this.receivers = _.map( this.receivers, this.createDestination, this )
        
        if( this.mappings ) this.mappings = _.map( this.mappings, this.createMapping, this )
      },
    }
    
    _.assign( AM.Application.prototype, {
      
Find all app inputs that use each destination and bind their emit function to generate output using the *output* method of the destination. 
            
      createDestination: function( _destination, key ) {
        var destination = AM.app.transportManager.createDestination( _destination )
      
        this.on( 'close', destination.close.bind( destination ) )
        
        return destination
      },
      
*createMapping* : Lookup the input and output device members and create a function that serves as an affine transform
between the input range and the output range. Add a listener to the input object that sends a message to the output destination 
whenever the input signal changes.

      createMapping: function( mapping ) {
        var inputIO, outputIO, _in, _out, transform, outputFunction, app = this, receivers
        
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
        
        if( mapping.output ) this.linkMappingOutputToDestinations( mapping, receivers )

        app.on( 'close', function() { inputIO.removeListener( mapping.input.name, outputFunction ) })  
        
        return mapping
      },
      
*createTransformFunction* get input / output mins maxs and ranges and create function using them to calculate affine
transform.      
      
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

*createOutputFunctionForMapping* call transform function and then applies end-user expressions as needed. Finally, it emits the *value* event,
which causes the mapping object to forward the resulting value to all its receivers.
      
      createOutputFunctionForMapping : function( mapping ) {
        return function( inputValue, previousInput ) { // 'this' will be bound to output app input...
          var output = mapping.transform ? mapping.transformFunction( inputValue ) : inputValue
          
          // TODO: is only one of these needed?
          // if( typeof this.expression    === 'function' ) output = this.expression( output )
          if( typeof mapping.expression === 'function' ) output = mapping.expression( output )
          
          this.emit( 'value', output )
        }
      },
      
*linkMappingOutputToDestinations* For every destination in the mappings output, register an event that forwards value messages to it. The destination
value can be a single array index, an array of indices, or -1 to indicate use of all receivers.

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