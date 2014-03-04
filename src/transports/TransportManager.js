var _ = require( 'lodash' )
TM = module.exports = {
app: null,
defaults: [ 'OSC' ],
loaded: [],
verify: function( transport, transportName ) {
var result = false

if( typeof transport === 'object' ) {
if( ( transport.init && transport.open && transport.close ) ) {
result = true
}else{
console.error( 'Transport ' + transportName + ' is not a valid transport module.' )
}
}

return result
},

load: function( transportName ) {
var transport

if( _.contains( TM.loaded, transportName ) ) {
console.log( 'Transport ' + transportName + ' is already loaded.' )
return
}

try {
transport = require( IM.app.root + 'transports/' + transportName + '.js' )
}catch( e ) {
console.log( 'Transport ' + transportName + ' not found.' )
return
}

if( TM.verify( transport, transportName ) ) {
transport.init( IM.app )
TM.loaded.push( transportName )
}
},

init: function( app ) {
this.app = app

_.forEach( this.defaults, this.load )

return this
},
}