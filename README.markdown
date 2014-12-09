# Interface.Server v2.

Interface.Server provides interactive control for distributed applications. It speaks a number of different protocols (OSC, WebSocket and 0MQ), and enables users to easily setup complex interfaces using a variety of devices that output in any of them. It is in development for the AlloSphere Research Group at UC Santa Barbara.

Interface files define inputs, outputs, receivers, and mappings between inputs and outputs. For example, the following JavaScript interface file, when loaded, will output the number `50` via OSC (Open Sound Control) whenever the `a` key is pressed:

```javascript
module.exports = {
  name:'myapp',
  
  transports: [
    { type:'osc', ip:'127.0.0.1', port:8080 },
  ],
  
  inputs: {
    // set range of expected values. receivers can be scalar or array of scalars
    fifty: { min: 0, max: 50, receivers:0 },
  },
  
  outputs :{},
  
  mappings: [
    // if no output object is found, simply call the expression with the provided input.
    { input: { io:'keypress', name:'a' }, output:{ io:'myapp', name:'fifty' } },
  ]
}
```

## Installation

Make sure you have `node.js` and `npm`. Then, at the top level of the repo, run:

`npm install`

This will install all necessary dependencies for the core server. Then you need to select which transport / device modules you want to install. Current transports are:

- osc
- websocket

Current devices are:

- gamepad
- keyboard
- phasespace

To install osc and keypress (the most minimal install):

```npm install interface.server.osc && npm install interface.server.keyboard```
## Running
To start the app from the top level of the repo:

`node index` or `node .`

There are a couple of different options to set with this command:

`--pathToApplications` This sets the directory where Interface.Server will search for application files. By default, this is the `applications` directory at the top level of the repo.

`--application` or `--app` The name of application to immediately load on launch. For example `node index --app test1`.

## Notes
There are a couple of test interface files in the `applications` directory that demonstrate how to create interfaces. The `test2` example shows how you can have a separate *interface* file, which defines inputs, outputs and expected ranges, from various *implementation* files, which contain mappings of devices to particular application inputs.

All aspects of the server can be controlled remotely (currently only via OSC and WebSockets, but 0MQ support will come soon). For example, to remove an application named test:

```javascript
/interface/applicationManager/removeApplicationWithName test
```

By default IS uses ports defined in config.js to determine which ports these remote control messages are received on.

To get behavior similar to the old device server, simply send a `handshake` message and pass the name of the application.

```javascript
/interface/handshake yourApplicationName
```

Ports and IP addresses for receiving messages are configured in the application files. If a receiver is defined with out an IP address (as is seen in applications/test1.js) the receiver will use the IP address that the `\handshake` message originated from. 
