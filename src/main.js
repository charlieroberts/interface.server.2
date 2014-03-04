var _ = require( 'lodash' ), EE = require('events').EventEmitter, util = require( 'util' ),
IS2 = {
ioManager: null,
transportManager: null,
interfaceManager: null,
root: __dirname + '/',
init: function() {
this.__proto__ = new EE()

this.emit( 'blah', 1 )
this.ioManager = require( './io/IOManager.js' ).init( this )
this.transportManager = require( './transports/TransportManager.js' ).init( this )
this.interfaceManager = require( './InterfaceManager.js' ).init( this )

setTimeout( this.interfaceManager.createApp.bind( this.interfaceManager ), 1000 )
}
}

IS2.init()