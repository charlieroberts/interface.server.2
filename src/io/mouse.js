/*
var gkm = require('gkm');
// Listen to all key events (pressed, released, typed)
gkm.events.on('key.*', function(data) {
    console.log(this.event + ' ' + data);
});
// Listen to all mouse events (click, pressed, released, moved, dragged)
gkm.events.on('mouse.*', function(data) {
    console.log(this.event + ' ' + data);
});
*/
var EventEmitter = require( 'events' ).EventEmitter,
    //gkm          = require( 'gkm' ),
    mouse        = require( 'term-mouse' )(),
    util         = require( 'util' ),
    fs           = require( 'fs' ),
    _            = require( 'lodash'),
Mouse = {
  inputs: {},
  outputs:{},
  devices:[],
  getDeviceNames: function() { /* return _.pluck( this.devices, 'product' ) */ },
  triggers: { ctrl:[], shift:[], nomod:[] },
  init: function() {
    // make `process.stdin` begin emitting "keypress" events
    if( this.onload ) this.onload()
    
    console.log( 'INITIALIZING MOUSE 0' )
    
    Mouse.devices.push( Mouse )
    
    console.log( 'INITIALIZING MOUSE 1' )
    
    mouse.start().on('click', function(e) {
      console.log('you clicked %d,%d with the %s mouse button', e.x, e.y, e.button);
    })
    // gkm.events.on('mouse.*', function(data) {
    // console.log(this.event + ' ' + data);
    // });
    
    console.log( 'INITIALIZING MOUSE 2' )
    // Keys._on = Keys.on.bind( Keys )
    //     
    // Keys.on = function( outputName, func ) {
    //   Keys.register( outputName, func )
    //   Keys._on( outputName, func )
    // }
        
    this.emit( 'new device', 'mouse', Mouse )
  },
  processKeystroke: function (ch, key) {
    if ( key && key.ctrl && key.name == 'c' ) { // ctrl+c
      process.exit()
      return
    }

    var group

    if( key.ctrl ) group = 'ctrl'
    if( key.shift ) group = 'shift'
    if( typeof group === 'undefined' ) group = 'nomod'
    
    if( key ) {
      var shouldEmit = key.name in Keys.triggers[ group ]
      
      if( shouldEmit ) {
        var name = group === 'nomod' ? key.name : group + '+' + key.name
        Keys.emit( name, 1 );
      }
    }
  },
  register: function( eventName, func ) {
    // var group = 'nomod', name
    //     
    // if( eventName.indexOf( 'ctrl' )  > -1 ) group = 'ctrl'
    // if( eventName.indexOf( 'shift' ) > -1 ) group = 'shift'
    //     
    // name = eventName.charAt( eventName.length - 1 ) // strip ctrl+ or shift+
    // 
    // Keys.triggers[ group ][ name ] = true
  }
}
Mouse.__proto__ = new EventEmitter()
Mouse.__proto__.setMaxListeners( 0 )

module.exports = Mouse