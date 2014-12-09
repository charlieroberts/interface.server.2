var EventEmitter = require( 'events' ).EventEmitter,
    keypress     = require( 'keypress' ),
    util         = require( 'util' ),
    fs           = require( 'fs' ),
    _            = require( 'lodash'),
Keys = { 
  inputs: {},
  outputs:{},
  devices:[],
  getDeviceNames: function() { /* return _.pluck( this.devices, 'product' ) */ },
  triggers: { ctrl:[], shift:[], nomod:[] },
  init: function() {
    // make `process.stdin` begin emitting "keypress" events
    keypress( process.stdin );
    
		var letters = "abcdefghijklmnopqrstuvwxyz`-=[];',./\\"

		for(var l = 0; l < letters.length; l++) {
			var lt = letters.charAt(l);
      Keys.outputs[ lt ] = { min:0, max:1, value:0 }
    }
    // listen for the "keypress" event
    process.stdin.on('keypress', Keys.processKeystroke );
    process.stdin.setRawMode(true);
    process.stdin.resume();

    if( this.onload ) this.onload()

    Keys.devices.push( Keys )

    Keys._on = Keys.on.bind( Keys )

    Keys.on = function( outputName, func ) {
      Keys.register( outputName, func )
      Keys._on( outputName, func )
    }
        
    this.emit( 'new device', 'keypress', Keys )
  },
  processKeystroke: function (ch, key) {
    if ( key && key.ctrl && key.name == 'c' ) { // ctrl+c
      process.exit()
      return
    }

    var group
    
    if( key ) {
      if( key.ctrl ) group = 'ctrl'
      if( key.shift ) group = 'shift'
      if( typeof group === 'undefined' ) group = 'nomod'
      
      var shouldEmit = key.name in Keys.triggers[ group ]
      
      if( shouldEmit ) {
        var name = group === 'nomod' ? key.name : group + '+' + key.name
        Keys.emit( name, 1 );
      }
    }
  },
  register: function( eventName, func ) {
    var group = 'nomod', name

    if( eventName.indexOf( 'ctrl' )  > -1 ) group = 'ctrl'
    if( eventName.indexOf( 'shift' ) > -1 ) group = 'shift'

    name = eventName.charAt( eventName.length - 1 ) // strip ctrl+ or shift+
    
    Keys.triggers[ group ][ name ] = true
  }
}
Keys.__proto__ = new EventEmitter()
Keys.__proto__.setMaxListeners( 0 )

module.exports = Keys