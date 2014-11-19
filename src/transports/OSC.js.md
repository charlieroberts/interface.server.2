OSC
===
_ is our lo-dash reference; omgosc refers to the node module, https://github.com/deanm/omgosc.
TODO: There is a change omgosc should be replaced with osc-min... requires research.
    !function() {
      
    var _ = require( 'lodash' ), 
            omgosc = require( '../external/omgosc' ),
            EE,
            oscInputCount = 0,
            IS,
		
    OSC = {
      app: IS,
      
      receivers: {},
      
      init: function() {
        this.__proto__ = new (require( 'events' ).EventEmitter)()
        // remote handles input OSC messages for remote control
        var remotePort = IS.config.remotePortOSC || 8081
        this.remote = this.receiver( remotePort, 'remote' )
      },
      
*receiver* Create an OSC receiver on given port with an optional name. If no name is provided, the port
will be named with a uuid. Return the newly opened socket for event handling.
      
      receiver: function( port, _name ) {
        if( typeof port === 'undefined' ) {
          console.log( "OSC error: no port provided to receiver constructor." )
          return
        }
        
        var oscin = new omgosc.UdpReceiver( port ),
            name = _name || oscInputCount++
        
        this.receivers[ name ] = oscin
        oscin.on('', function( args ) {    // path, typetags, params 

          var address = args.params.info.address
          args.params.unshift( args.path ) // switchboard.route accepts one array argument with path at beginning
          args.params.push( address )      // push osc address to end of message
          
          var shouldReply = OSC.app.switchboard.route.apply( OSC.app.switchboard, args.params )
          if( shouldReply ) {
            // TODO: where should the result be sent to???
          }
        })
        
        return oscin
      },

*sender* Create an OSC sender on a given port with an optional IP address. If no IP address is provided, localhost
will be used. Return the newly opened socket for sending messages.

      sender: function( _ip, _port ) {
        var port = _port || 8080,
            ip   = _ip || '127.0.0.1',
            sender = new omgosc.UdpSender( ip, port )
        
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
    
    module.exports = function( __IS ) { if( typeof IS === 'undefined' ) { IS = __IS; } OSC.app = IS; return OSC; }
    
    }()
