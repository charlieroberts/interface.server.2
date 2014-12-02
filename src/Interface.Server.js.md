main.js
=======
    !function() {
      
    var _ = require( 'lodash' ), 
        EE = require( 'events' ).EventEmitter,
        fs = require( 'fs'),
        parseArgs = require('minimist'),
        Types, IS2;

    IS2 = {
      ioManager: null,
      transportManager:   null,
      applicationManager: null,
      root: __dirname + '/',
      init: function() {
        this.__proto__ = new EE()
        this.__proto__.setMaxListeners( 0 )
        
        this.config = require( __dirname + '/../config.js' )
        
        var args = parseArgs( process.argv.slice(2) )
        
        _.assign( this.config, args )

        this.ioManager          = require( './io/IOManager.js' )( this ).init()
        this.transportManager   = require( './transports/TransportManager.js' )( this ).init()
        this.applicationManager = require( './ApplicationManager.js' )( this ).init()
        this.switchboard        = require( './Switchboard.js' )( this ).init()
        Types = this.types      = require( './Types.js' )( this ).init()
        
        // shortcuts for connecting / disconnecting these make it /interface/handshake instead of /interface/applicationManager/handshake
        this.handshake = this.applicationManager.handshake
        this.disconnectApplication = this.applicationManager.removeApplicationWithName
        
        if( this.onload ) this.onload()
        
        return this
      }
    }
    
    module.exports = IS2
     
    }()
    
// var q = [ .65,-.27,.65,.27 ]
// console.log( "CONVERT", Types.convert( 'Quaternion', 'Euler', q ) )
