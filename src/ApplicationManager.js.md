ApplicationManager
==================
The *ApplicationManager* object handles the creation of *applications*, which are essentially collections of
*mappings* between input and output *IO* objects along with transports defining where the application receives
input messages. 

    !function() {
      
    var _  = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        fs = require( 'fs' ),
        IS,
		
    AM = {

*interfaces* is an dictionary of all currently running interfaces in Interface.Server.

      applications: {},
      
      init: function() {
        this.__proto__ = new EE()
        this.__proto__.setMaxListeners( 0 )
        
        this.on( 'new application', function( application ) {
          if( ! _.has( AM.applications, application.name ) ) {
            AM.applications[ application.name ] = application
          }
        })
        
        if( 'application' in IS.config ) 
          AM.loadApplicationWithName( IS.config.application )
        else if( 'app' in IS.config )
          AM.loadApplicationWithName( IS.config.app )
        
        return this
      },
      
      handshake: function( appName, ip ) {
        var app = AM.loadApplicationWithName( appName, ip )
        
        return app
      },
      
      connectApplication: function( spec, ip ) {},
      
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

*createApp* is used to generate an application (a set of inputs that with mappings and associated transports) from a provided
JavaScript string. Useful when app data is transmitted over a network
  
      createApplicationWithText: function( appString, ip ) {
        var io, transports, app
                
        eval( appString )
        
        if( ip ) app.ip = ip
        
        app = new AM.Application( app )

Emit an event telling the ApplicationManager listeners that a new application has been created.
     
        this.emit( 'new application', app )
        
        return app
      },
      
*createAppplicationWithObj* is used to generate an application (a set of inputs that with mappings and associated transports) from a provided
JavaScript object.
      createApplicationWithObject: function( obj ) {
        var app = new AM.Application( obj )
    
        this.emit( 'new application', app )
        
        return app
      },
      
      removeAllApplications: function( doNotRemove ) {
        for( var appName in AM.applications ) {
          if( appName !== doNotRemove ) {
            AM.removeApplicationWithName( appName )
          }
        }
      },

      removeApplicationWithName : function( name ) {
        var app = AM.applications[ name ]
        
        if( typeof app !== 'undefined')
          app.emit( 'close' )
        else
          console.log( "App " + name + " tried to disconnect but is not currently registered." )
      },
      
      Application: function( properties ) {
        _.assign( this, properties )
        
        if( _.has( AM.applications, this.name ) ) {
          if( AM.applications[ this.name ].ip === this.ip ) {
            console.log("Closing existing app with name " + this.name + " to make way for new registration" )
            AM.applications[ this.name ].emit( 'close' )
          }
        }
        
        this.initialProperties = properties
        
        this.io = new AM.app.ioManager.IO({ inputs:this.inputs, outputs:this.outputs, name: this.name })
        
        this.transports = _.map( this.transports, this.createDestination, this )
        
        if( this.mappings ) this.mappings = _.map( this.mappings, this.createMapping, this )
        
        this.on( 'close', function() { 
          for( var i = 0; i < this.mappings.length; i++ ) {
            var mapping = this.mappings[ i ]
            if( mapping ) {
              if( mapping.inputControl && mapping.inputControl.removeAllListeners ) { mapping.inputControl.removeAllListeners() }
              if( mapping.outputControl && mapping.outputControl.removeAllListeners ) { mapping.outputControl.removeAllListeners() }            
            }
          }
          
          console.log("Closing application ", this.name )
          this.removeAllListeners()
        }.bind(this) )
      },
    }
    
    _.assign( AM.Application.prototype, {
      
Find all app inputs that use each destination and bind their emit function to generate output using the *output* method of the destination. 
            
      createDestination: function( _destination, key ) {
        if( typeof _destination.ip === 'undefined' ) {
          // ip is assigned in loadApplicationWithName method of ApplicationManager
          _destination.ip = this.ip
        }
        var destination = AM.app.transportManager.createDestination( _destination )
      
        //this.on( 'close', destination.close.bind( destination ) )
        
        return destination
      },
      
*createMapping* : Lookup the input and output device members and create a function that serves as an affine transform
between the input range and the output range. Add a listener to the input object that sends a message to the output destination 
whenever the input signal changes.

      createMapping: function( mapping ) {
        var inputIO, outputIO, _in, _out, transform, outputFunction, app = this, transports
    
        inputIO  = AM.app.ioManager.devices[ mapping.input.io ]
     
        if( typeof inputIO === 'undefined' ) {
          IS.ioManager.on( 'new device', function( device ){
            var output = mapping.output ? mapping.output.name : 'an expression'
            console.log( "Device added; mapping " + mapping.input.name + ' to ' + output + ' in app ' + app.name )
            if( device.name === mapping.input.io ) {
              inputIO = AM.app.ioManager.devices[ mapping.input.io ]
          
              this.linkMapping( mapping, inputIO )
            }
          }.bind( this ))
          console.log( 'ERROR: Input IO device ' + mapping.input.io + ' is not found. Cannot map ' + mapping.input.name + '. Please connect IO device.' )
          return
        }
    
        this.linkMapping( mapping, inputIO )
    
        return mapping
      },
  
      linkMapping: function( mapping, inputIO ) {
        var _in  = inputIO.outputs[ mapping.input.name ]
        if( mapping.output ) {
          var outputIO = AM.app.ioManager.devices[ mapping.output.io ]
      
          var _out = outputIO.inputs[ mapping.output.name ]
          _out.__proto__ = new EE()
      
          var transform = this.createTransformFunction( _in, _out )
    
          var outputFunction = this.createOutputFunctionForMapping( mapping ).bind( _out )
      
          mapping.outputControl = _out
          mapping.outputFunction = outputFunction
          mapping.transformFunction = transform
          mapping.transform = typeof mapping.transform !== 'undefined' ? mapping.transform : true
      
        }else if( mapping.expression ){
          outputFunction = function( inputValue ) {
            return mapping.expression( inputValue )
          }
        }else{
          return 
        }
    
        inputIO.on( mapping.input.name, outputFunction )
    
        mapping.inputControl = _in
    
        if( mapping.output ) this.linkMappingOutputToDestinations( mapping, this.transports )
      
        this.on( 'close', function() { 
          inputIO.removeListener( mapping.input.name, outputFunction ) 
        }) 
      },
*createTransformFunction* get input / output mins maxs and ranges and create function using them to calculate affine
transform.      
      
      createTransformFunction : function( _in, _out ) {        
        return function( value ) {
          var _in = this.inputControl, _out = this.outputControl, 
              inputRange = _in.max - _in.min,
              outputRange = _out.max - _out.min,
              valueAsPercent = ( value - _in.min ) / inputRange,
              output = outputRange * valueAsPercent
              
          output += _out.min
          
          return output
        }
      },

*createOutputFunctionForMapping* call transform function and then applies end-user expressions as needed. Finally, it emits the *value* event,
which causes the mapping object to forward the resulting value to all its transports.
      
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
value can be a single array index, an array of indices, or -1 to indicate use of all transports.

      linkMappingOutputToDestinations: function( mapping ) {
        var transports
        if( Array.isArray( mapping.outputControl.transports ) ) {
          transports = []
          for( var i = 0; i < mapping.outputControl.transports.length; i++ ) {
            transports[ i ] = this.transports[ mapping.outputControl.transports[ i ] ]
          }
        }else if( typeof mapping.outputControl.transports === 'number' ){
          transports = typeof this.transports[ mapping.outputControl.transports ] !== 'undefined' ? [ this.transports[ mapping.outputControl.transports ] ] : this.transports
        }else{
          transports = this.transports
        }

        for( var i = 0; i < transports.length; i++ ) {
          ( function() {
            var destination = transports[ i ]
            if( _.isObject( destination ) ) {
              var func = function( _value ) {
                if( _value instanceof Array){
                  destination.output( '/' + mapping.output.name, Array(_value.length+1).join('f'), _value )
                }else{
                  destination.output( '/' + mapping.output.name, 'f', [ _value ] )
                }
              }
              mapping.outputControl.on( 'value', func )
            }else{
              console.log( 'A null destination was encountered for mapping ' + mapping )
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
