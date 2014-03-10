Switchboard
===========
The *Switchboard* object handles remote requests to the IS2. It is incumbent to the individual transport mechanisms
to forward messages to the Switchboard in the appropriate format. Ideally, the Switchboard ensures that remote
control of IS2 is possible over OSC, WebSocket, 0MQ etc. Any message that begins with the path /interface should be 
forwarded to the Switchboard for processing.

_ is our lo-dash reference, while HID refers to the node HID module, https://www.npmjs.org/package/node-hid.

    var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, IS2,
		
    SB = module.exports = {
      
      init: function( app ) {
        IS2 = app
        
        Object.defineProperties( IS2, { // for routing purposes
          applications : {
            get: function() { return IS2.applicationManager.applications },
            set: function(v) { IS2.applicationManager.applications = v }
          }
        })
        
        this.__proto__ = new EE()

        return this
      },
      
      route : function() {
        var args = Array.prototype.slice.call( arguments, 0 ),
            msg  = args[ 0 ],
            msgArgs = args.slice( 1 ),
            components = msg.split( '/' ).slice( 2 ), // first should be empty, second is 'interface'
            output = null, // return null if this is not a getter call
            i = 1, 
            value = IS2[ components[0] ],
            tValue = 'object',
            found = null, lastObject = null
            
        while( i < components.length && tValue === 'object' ) {
          lastObject = value
          value = value[ components[ i ] ]
          tValue = typeof value
          i++
        }

        if( typeof value === 'function' ) {
          if( msgArgs.length ) {
            value.apply( lastObject, msgArgs )
          }else{
            output = value()
          }
        }else{
          if( msgArgs.length ) {
            lastObject[ components[ i - 1 ] ] = msgArgs[ 0 ]
          }else{
            output = lastObject[ components[ i - 1 ] ]
          }
        }
        
        return output
      },
    }