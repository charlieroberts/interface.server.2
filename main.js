var _
IS2 = {
moduleManager: null,
packages: {
lodash : null
},
root: __dirname + '/',
init: function() {
_ = this.packages.lodash = require( 'lodash' )

this.moduleManager = require( './io/IOManager.js' ).init( this )
}
}

IS2.init()