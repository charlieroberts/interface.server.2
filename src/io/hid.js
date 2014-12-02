var _ = require( 'lodash' ), HID, EE = require('events').EventEmitter, util = require( 'util' )
_HID = module.exports = {
  app: null,
  devices: null,
  loaded: [],
  getDeviceNames: function() { return _.pluck( this.devices, 'product' ) },
  init: function( app ) {
    this.app = app
    this.__proto__ = new EE()
    this.__proto__.setMaxListeners( 0 )
            
    HID = require( 'node-hid' )
    
    this.devices = HID.devices()
    
    console.log( this.getDeviceNames() )
  },
  
  test: function() {
    var idx = _.findIndex( this.devices, { manufacturer:'Mega World'} ),
        device = new HID.HID( this.devices[ idx ].path )
    
    device.name = this.devices[ idx ].product
    device.btnState = [0,0,0,0,0,0,0]
    
    device.outputs = _HID.outputs
    
    this.emit( 'new device', device.name, device )
    this.loaded.push( device )
    device.on( 'data', this.read.bind( device ) )
  },
  
 
  read: function( data ) {
    var xaxis = data[ 0 ],
        yaxis = data[ 1 ],
        btns = data[ 2 ]
        
    if( xaxis !== this.xaxis ) {
      this.emit( 'X', xaxis, this.xaxis )
      this.xaxis = xaxis
    }else if( yaxis !== this.yaxis ) {
      this.emit( 'Y', yaxis, this.yaxis )
      this.yaxis = yaxis
    }else{
      var store = 1,
          btnState = [],
          mask = 1
      
      for( var i = 0; i < 8; i++ ) {
        var state = btnState[ i ] = (btns & mask) / mask,
            prev  = this.btnState[ i ]
        
        if( state !== prev ) {
          this.emit( 'Button' + i, state, prev )
        }
        
        mask *= 2 
      }
      
      this.btnState = btnState
    }
    
  },
  inputs: {},
  outputs:{
    'X': { min:0, max:255, value:127 },
    'Y': { min:0, max:255, value:127 },
    'Button0': { min:0, max:1, value:0 },
    'Button1': { min:0, max:1, value:0 },
    'Button2': { min:0, max:1, value:0 },
    'Button3': { min:0, max:1, value:0 },
    'Button4': { min:0, max:1, value:0 },
    'Button5': { min:0, max:1, value:0 },
    'Button6': { min:0, max:1, value:0 },
    'Button7': { min:0, max:1, value:0 },                                                        
  }
}