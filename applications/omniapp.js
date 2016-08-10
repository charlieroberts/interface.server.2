module.exports = {
  name:'omniapp',

  transports: [
    { type:'osc', port:12001 },
  ],
  
  inputs: {
    mx:  { min: 0, max: 1 },
  },
  
  outputs :{},

  mappings: [
    { input: { io:'keyboard', name:'a' }, expression: function(v) { console.log("Key input a", v) } },
    { input: { io:'keyboard', name:'b' }, output:{ io:'omniapp', name:'mx' } }
  ],
}