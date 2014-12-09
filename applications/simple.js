module.exports = {
  name:'test1',

  receivers: [
    { type:'osc', ip:'127.0.0.1', port:8080 },
  ],
  
  inputs: {
    blah:  { min: 200, max: 300, receivers:0 },
  },
  
  outputs :{},

  mappings: [
    { input: { io:'keyboard', name:'a' }, expression: function(v) { console.log(v, v * 15) } },
    { input: { io:'keyboard', name:'b' }, output:{ io:'test1', name:'blah' } }
  ],
}