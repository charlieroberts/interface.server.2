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
    
    this.config             = require( __dirname + '/../config.js' )
    
    var args = parseArgs( process.argv.slice(2) )
    
    _.assign( this.config, args )
    this.ioManager          = require( './io/IOManager.js' )( this ).init()
    this.transportManager   = require( './transports/TransportManager.js' )( this ).init()
    this.applicationManager = require( './ApplicationManager.js' )( this ).init()
    this.switchboard        = require( './Switchboard.js' )( this ).init()
    Types = this.types      = require( './Types.js' )( this ).init()
    
    this.handshake = this.applicationManager.handshake
    
    if( this.onload ) this.onload()
    
    return this
  }
}

module.exports = IS2
 
}()
