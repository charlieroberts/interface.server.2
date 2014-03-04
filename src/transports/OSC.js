var _ = require( 'lodash' ), omgosc, EE, oscInputCount = 0,
OSC = module.exports = {
app: null,

receivers: {},

init: function( app ) {
this.app = app

EE = require( 'events' ).EventEmitter

omgosc = require( 'omgosc' )
},


receiver: function( port, _name ) {
var oscin = new omgosc.UdpReceiver( port || 8080 ),
name = _name || oscInputCount++

this.receivers[ name ] = oscin

return oscin
},
sender: function( _port, _ip ) {
var port = _port || 8080,
ip   = _ip || '127.0.0.1'

return new omgosc.UdpSender( port, ip )
},

close: function( name ) {
if( name ) {
this.receivers[ name ].close()
delete this.receivers[ name ]
}else{
_.forIn( this.receivers, function( recv ) {
recv.close()
})
this.receivers = {}
}
},
}