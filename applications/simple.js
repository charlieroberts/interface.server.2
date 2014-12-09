module.exports = {
  name:'simple',

  transports: [
    { type:'osc', port:10080 },
  ],
  
  inputs: {
    blah:  { min: 200, max: 300 },
  },
  
  outputs :{},

  mappings: [
    { input: { io:'keyboard', name:'a' }, expression: function(v) { console.log("Key input a", v) } },
    { input: { io:'keyboard', name:'b' }, output:{ io:'simple', name:'blah' } }
  ],
}