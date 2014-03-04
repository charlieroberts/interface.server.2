var _ = require( 'lodash' )
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

//console.log(IM.app.root + 'io/' + ioName + '.js')
try {
io = require( IM.app.root + 'io/' + ioName + '.js' )
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

_.forEach( this.defaults, this.load )

return this
},

IO : function( props ) {
_.assign( this, {
inputs:  {},
outputs: {},
})

_.assign( this, props )
},
}

_.assign( IM.IO.prototype, {
getInputNames:  function() { return _.keys( this.inputs ) },
getOutputNames: function() { return _.keys( this.outputs ) },
})