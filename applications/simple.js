module.exports = {
  name:'test1',

  transports: [
    { type:'osc', port:8080 },
  ],
  
  inputs: {
    blah:  { min: 200, max: 300 },
  },
  
  outputs :{},

  mappings: [
    { input: { io:'keyboard', name:'a' }, expression: function(v) { console.log(v, v * 15) } },
    { input: { io:'keyboard', name:'b' }, output:{ io:'test1', name:'blah' } }
  ],
}