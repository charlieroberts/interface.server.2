Switchboard
===========
The *Switchboard* object handles remote requests to the IS2. It is incumbent to the individual transport mechanisms
to forward messages to the Switchboard in the appropriate format. Ideally, the Switchboard ensures that remote
control of IS2 is possible over OSC, WebSocket, 0MQ etc. Any message that begins with the path /interface should be 
forwarded to the Switchboard for processing.

_ is our lo-dash reference, while HID refers to the node HID module, https://www.npmjs.org/package/node-hid.

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