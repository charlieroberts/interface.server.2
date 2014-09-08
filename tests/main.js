var testApp = require('./testapp')

global.IS2 = require('../src/Interface.Server').init()

setTimeout( function() {
  IS2.applicationManager.createApplicationWithObject( testApp )
  //this.switchboard.route( '/interface/applications/test/inputs/blah/min', 0 )
}.bind(this), 2000 )