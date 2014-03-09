var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, App
Switch = module.exports = {
  
  init: function( app ) {
    App = app
    
    this.__proto__ = new EE()
    return this
  },
  
  '/interface/createApplicationWithText': function( text ) {
    App.applicationManager.createApplicationWithText( text )
  },
  
  '/interface/removeApplicationWithName': function( name ) {
    App.applicationManager.removeApplicationWithName( name )
  },
  // TODO: should be: /interface/test/blah/setMin 100
  '/interface/changeInputPropertyForApplication': function( applicationName, inputName, propertyName, newValue ) {
    var app = App.applicationManager.applications[ applicationName ],
        input = app.inputs[ inputName ]
        
    input[ propertyName ] = newValue
    console.log( propertyName, input[ propertyName ] )
  },
}