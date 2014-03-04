var _
IM = module.exports = {
app: null,
defaults: [ 'hid' ],
loaded: [],
verify: function( io ) {
var result = false

if( typeof io === 'object' ) {
if( ( io.inputs || io.outputs ) && io.init ) {
result = true
}
}

return result
},

load: function( ioName ) {
var io

if( _.contains( IM.loaded, ioName ) ) {
console.log( 'module ' + ioName + ' is already loaded.' )
return
}

try {
io = require( IM.app.root + 'lib/' + ioName + '.js' )
}catch( e ) {
console.log( 'module ' + ioName + ' not found.' )
return
}

if( IM.verify( io ) ) {
io.init( IM.app )
IM.loaded.push( ioName )
}
},

init: function( app ) {
this.app = app
_ = this.app.packages.lodash

_.forEach( this.defaults, this.load )
},
}