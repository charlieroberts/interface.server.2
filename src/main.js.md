main.js
=======

    var _ = require( 'lodash' ), EE = require('events').EventEmitter,

    IS2 = {
      ioManager: null,
      transportManager:   null,
      applicationManager: null,
      root: __dirname + '/',
      init: function() {
        this.__proto__ = new EE()
        
        this.ioManager          = require( './io/IOManager.js' ).init( this )
        this.transportManager   = require( './transports/TransportManager.js' ).init( this )        
        this.applicationManager = require( './ApplicationManager.js' ).init( this )
        
        setTimeout( this.applicationManager.createApp.bind( this.applicationManager, this.applicationManager.testApp ), 1000 )
      }
    }
    
    IS2.init()