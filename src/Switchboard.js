!function() {
  
var _ = require( 'lodash' ), 
    EE = require( 'events' ).EventEmitter,
    IS,
SB = {
  
  init: function() {
    Object.defineProperties( IS, { // for routing purposes
      applications : {
        configurable: true,
        get: function() { return IS.applicationManager.applications },
        set: function(v) { IS.applicationManager.applications = v }
      }
    })
    
    this.__proto__ = new EE()
    this.__proto__.setMaxListeners( 0 )
    
    return this;
  },
  
  requiresAddress: [
    'handshake', 'createApplicationWithText'
  ],
  route : function( args, address ) {
    var msg  = args[ 0 ],
        msgArgs = args.slice( 1 ),
        components = msg.split( '/' ).slice( 2 ), // first should be empty, second is 'interface'
        output = null, // return null if this is not a getter call
        i = 1, 
        value = IS[ components[0] ],
        tValue = 'object',
        found = null, lastObject = null, instanceVariableName
    
    // console.log( args, msg, msgArgs, address, components )
    if( !components.length ) return // not a switchboard message
    
    while( i < components.length && tValue === 'object' ) {
      lastObject = value
      value = value[ components[ i ] ]
      tValue = typeof value
      i++
    }
    
    instanceVariableName = components[ i - 1]
    
    if( SB.requiresAddress.indexOf( instanceVariableName ) > -1 ) {
      msgArgs.push( address )
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

module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } SB.app = IS; return SB; }

}()