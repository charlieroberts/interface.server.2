module.exports = {
  name:'test2',
  defaultImplementation:'index.js',
  
  receivers: [
    { type:'OSC', ip:'127.0.0.1', port:8080 },
    { type:'OSC', ip:'127.0.0.1', port:18080 },
    { type:'ZeroMQ', ip:'127.0.0.1', port:10080 },
  ],
  
  inputs: {
    // set range of expected values. destinations can be scalar or array of scalars
    blah:  { min: 200, max: 300, receivers:0 },
    
    // if no receivers are specified, output goes to all receivers
    blah2: { min: 0, max: 1, },
    
    blah3: { min: 0, max: 1, receivers:[0,1] },
  },
  
  outputs :{},
}