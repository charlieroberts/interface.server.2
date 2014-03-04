var _ = require( 'lodash' )
TM = module.exports = {
app: null,
defaults: [ 'OSC' ],
loaded: {},
verify: function( transport, transportName ) {
var result = false

if( typeof transport === 'object' ) {
if( ( transport.init ) ) {
result = true
}else{
console.error( 'Transport ' + transportName + ' is not a valid transport module.' )
}
}

return result
},

load: function( transportName ) {
var transport

if( _.has( TM.loaded, transportName ) ) {
console.log( 'Transport ' + transportName + ' is already loaded.' )
return
}

//console.log( TM.app.root + 'transports/' + transportName + '.js ')

try {
transport = require( TM.app.root + 'transports/' + transportName + '.js' )
}catch( e ) {
console.log( 'Transport ' + transportName + ' not found.' )
return
}finally{
console.log( 'Transport ' + transportName + ' is loaded.' )
}

if( TM.verify( transport, transportName ) ) {
transport.init( TM.app )
TM.loaded[ transportName ] = transport
}
},

init: function( app ) {
this.app = app

_.forEach( this.defaults, this.load )

return this
},
}