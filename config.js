// pathToApplications determines where interface.server looks for
// js files describing application inputs, outputs and mappings

module.exports = {
    pathToApplications: __dirname + '/applications',
    
    transports: {
      osc : {
        remoteControlPort: 12000,
      },
      websocket: {
        webServerPort: 9080
      }
    },
    
    IO : {
      // phasespace : {},
      // hid : {},
      keyboard : {},
    }
}