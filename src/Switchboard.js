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