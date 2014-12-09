/* 

This test is a simple example of using Node.js and OSC
to connect to Interface.Server using a small app defined
here. You must have the interface.server.osc module installed
for this script to run.

Additionally, this script requires the osc-min module.
*/

var oscMin = require( 'osc-min' ),
    udp = require( 'dgram'),
    oscReceivePort = 12001,
    destinationIP = '127.0.0.1'

// open socket and listen for messages    
osc = udp.createSocket( 'udp4', function( msg, rinfo ){
   var oscMsg = oscMin.fromBuffer( msg )
   
   console.log( oscMsg ) 
})
osc.bind( oscReceivePort )

// define app
var app = "app = { name:'test1', transports: [{ type:'osc', port:" + oscReceivePort + " }]," +
    "inputs: {blah:  { min: 200, max: 300, receivers:0 }, "+
    "blah2: { min: 0, max: 1 } },"+
    "outputs :{},"+
    "mappings: [{ input: { io:'keyboard', name:'b' }, output:{ io:'test1', name:'blah2' } }]"+
    "}"

// convert app to OSC buffer
var buf = oscMin.toBuffer({
    address: '/interface/applicationManager/createApplicationWithText',
    args: [ app ]
})

// send buffer
osc.send( buf, 0, buf.length, 12000, destinationIP )