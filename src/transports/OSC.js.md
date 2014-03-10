OSC
===
_ is our lo-dash reference; omgosc refers to the node module, https://github.com/deanm/omgosc.
TODO: There is a change omgosc should be replaced with osc-min... requires research.

    var _ = require( 'lodash' ), omgosc, EE, oscInputCount = 0,
		
    OSC = module.exports = {
      app: null,
      
      receivers: {},
      
      init: function( app ) {
        this.app = app      
        this.__proto__ = new (require( 'events' ).EventEmitter)()
        
        omgosc = require( 'omgosc' )
        
        // remote handles input OSC messages for remote control
        this.remote = this.receiver( 8081, 'remote' )
      },
      
*receiver* Create an OSC receiver on given port with an optional name. If no name is provided, the port
will be named with a uuid. Return the newly opened socket for event handling.
      
      receiver: function( port, _name ) {
        var oscin = new omgosc.UdpReceiver( port || 8081 ),
            name = _name || oscInputCount++
        
        this.receivers[ name ] = oscin
        oscin.on('', function( args ) {    // path, typetags, params 
          args.params.unshift( args.path ) // switchboard.route accepts one array argument with path at beginning
          var shouldReply = OSC.app.switchboard.route.apply( OSC.app.switchboard, args.params )
          if( shouldReply ) {
            // TODO: where should the result be sent to???
          }
        })
        
        return oscin
      },

*sender* Create an OSC sender on a given port with an optional IP address. If no IP address is provided, localhost
will be used. Return the newly opened socket for sending messages.

      sender: function( _port, _ip ) {
        var port = _port || 8080,
            ip   = _ip || '127.0.0.1',
            sender = new omgosc.UdpSender( port, ip )
        
        sender.output = function( address, typetags, values ) {
          this.send( address, typetags, values )
        }
        
        return sender
      },

*close* Close a socket using an optional name argument. If no name argument is provided, all
existing OSC sockets are closed.
      
      close: function( name ) {
        if( name ) {
          this.receivers[ name ].close()
          delete this.receivers[ name ]
        }else{
          _.forIn( this.receivers, function( recv ) {
            recv.close()
          })
          this.receivers = {}
        }
      },
    }