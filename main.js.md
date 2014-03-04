main.js
=======

    var _

    IS2 = {
      moduleManager: null,
      hid: null,
      packages: {
        lodash : null
      },
      root: __dirname + '/../',
      init: function() {
        _ = this.packages.lodash = require( '../build/node_modules/lodash' )
        
        this.moduleManager = require( './ModuleManager.js' ),
        this.hid           = require( './hid.js' )
        
        this.moduleManager.init( this )
      }
    }
    
    IS2.init()