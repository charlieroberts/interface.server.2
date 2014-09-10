# Interface.Server v2.

Interface.Server provides interactive control for distributed applications. It speaks a number of different protocols (OSC, WebSocket and 0MQ), and enables users to easily setup complex interfaces using a variety of devices that output in any of them. It is in development for the AlloSphere Research Group at UC Santa Barbara.

Interface files define inputs, outputs, receivers, and mappings between inputs and outputs. For example, the following JavaScript interface file, when loaded, will output the number `50` via OSC (Open Sound Control) whenever the `a` key is pressed:

```javascript
module.exports = {
  name:'myapp',
  
  receivers: [
    { type:'OSC', ip:'127.0.0.1', port:8080 },
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

This will install all necessary dependencies.

## Running
To start the app:

`node index`

There are a couple of different options to set with this command:

`--pathToApplications` This sets the directory where Interface.Server will search for application files. By default, this is the `applications` directory at the top level of the repo.

`--application` or `--app` The name of application to immediately load on launch. For example `node index --app test1`.

## Notes
This is very beta. There are a couple of test interface files in the `applications` directory that demonstrate how to create interfaces. The `test2` example shows how you can have a separate *interface* file, which defines inputs, outputs and expected ranges, from various *implementation* files, which contain mappings of devices to particular application inputs.