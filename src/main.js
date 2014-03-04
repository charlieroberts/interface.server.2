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
this.applicationManager = require( './ApplicationManager.js' ).init( this )

setTimeout( this.applicationManager.createApp.bind( this.applicationManager, this.applicationManager.testApp ), 1000 )
}
}

IS2.init()