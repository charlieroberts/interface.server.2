var testApp = require('./testapp.js')

global.IS2 = require('../src/Interface.Server')

global.IS2.onload = function() {
  //IS2.applicationManager.createApplicationWithObject( testApp )
  IS2.applicationManager.loadApplicationWithName( 'test2' )
  //this.switchboard.route( '/interface/applications/test/inputs/blah/min', 0 )
}

global.IS2.init()