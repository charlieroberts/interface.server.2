module.exports = {
  name:'guitest', 
  
  transports: [{ type:'osc', port:15000 }],
  
  inputs: { blah2: { min: 0, max: 1 } },
  
  outputs: {},
  
  mappings: [
    { input: { io:'mydevice', name:'slider' }, output:{ io:'guitest', name:'blah2' } },
    { input: { io:'keyboard', name:'b' },      output:{ io:'mydevice', name:'slider' } },
    { input: { io:'mydevice', name:'button' }, expression: function( v ){ console.log( 'yo' ); } }
  ]
}
