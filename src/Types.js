!function() {
  
var _ = require( 'lodash' ), 
    EE = require( 'events' ).EventEmitter,
    IS,
Types = {
  Quaternion: { dimensions:4, type:'number' },
  Euler     : { dimensions:3, type:'number' },
  Float : { dimensions:1, type:'number' },
  String: { dimensions:1, type:'string' },
  Int   : { dimensions:1, type:'number' },
  Raw   : {},
  
  init: function() {
    this.__proto__ = new EE()
    this.__proto__.setMaxListeners( 0 )
    
    return this;
  },
  convert: function( type, newType, value ) {
    var func = Types.table[ type ][ newType ]
    
    return func( value )
  },
}
    
Types.table = {
   Quaternion : {
    Euler : function( quat ) {
      var pitch, roll, yaw, qx = quat[0], qy =quat[1], qz = quat[2], qw = quat[3]
      
      pitch = Math.asin(2*qx*qy + 2*qz*qw) 
      
      if( qx*qy + qz*qw === .5 ) {
        roll = 0
        yaw  = 2 * atan2(qx, qw) 
      }else if( qx*qy + qz*qw === .5 ) {
        yaw = -2 * atan2(qx,qw)
        roll = 0
      }else{
        yaw = Math.atan2(2*qy*qw-2*qx*qz , 1 - (2*(qy*qy)) - (2*(qz*qz)) )
        roll = Math.atan2(2*qx*qw-2*qy*qz , 1 - (2*(qx*qx)) - (2*(qz*qz)) )
      }
      
      return [ pitch, roll, yaw ]
    },
  },
  Euler : {
    Quaternion : function( euler ) {
      // taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/
      var c1 = Math.cos( yaw/2 ),
          s1 = Math.sin( yaw/2 ),
          c2 = Math.cos( pitch/2 ),
          s2 = Math.sin( pitch/2 ),
          c3 = Math.cos( roll/2 ),
          s3 = Math.sin( roll/2 ),
          c1c2 = c1*c2,
          s1s2 = s1*s2,
          w = c1c2*c3 - s1s2*s3,
    	    x = c1c2*s3 + s1s2*c3,
  	      y = s1*c2*c3 + c1*s2*s3,
  	      z = c1*s2*c3 - s1*c2*s3
          
      return [ x,y,z,w ]
    },
  },
  String: {
    Float: function( string ) { return parseFloat( string ) },
    Int: function( string ) { return parseInt( string ) }
  },
  Float: {
    String: function( float ) { return "" + float },
    Int: function( float ) { return Math.round( float ) }
  },
  Int: {
    String: function( int ) { return "" + int },
    Float: function( int ) { return int }
  },
}

module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } Types.app = IS; return Types; }
}()