var _ = require( 'lodash' ), EE = require( 'events' ).EventEmitter, App
Switch = module.exports = {
  
  init: function( app ) {
    App = app
    
    this.__proto__ = new EE()
    return this
  },
  
  '/interface/createApplicationWithText': function( text ) {
    App.applicationManager.createApp( text )
  },
  '/interface/removeApplicationWithName': function( name ) {
    App.applicationManager.removeApplicationWithName( name )
  },
}