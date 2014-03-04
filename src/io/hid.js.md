HID
===
_ is our lo-dash reference, while HID refers to the node HID module, https://www.npmjs.org/package/node-hid.

    var _ = require( 'lodash' ), HID, EE,
		
    _HID = module.exports = {
      app: null,
      devices: null,
      loaded: [],
      getDeviceNames: function() { return _.pluck( this.devices, 'product' ) },
      init: function( app ) {
        this.app = app
                
        EE = require( 'events' ).EventEmitter
        
        HID = require( 'node-hid' )
        
        this.devices = HID.devices()
        
        console.log( this.getDeviceNames() )
        
        var idx = _.findIndex( this.devices, { manufacturer:'Mega World'} )
        var device = new HID.HID( this.devices[ idx ].path )
        
        device.btnState = [0,0,0,0,0,0,0]
        
        this.loaded.push( device )

        device.on( 'data', this.read.bind( device ) )
      },

*read* examines buffered hex data the gamepad outputs and emits notification when changes occur
     
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
          
Bit masking is used to examine button state and compare it to previous values
as the value of all buttons on the gamepad are stored in a single 8-bit int

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