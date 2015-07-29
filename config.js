// pathToApplications determines where interface.server looks for
// js files describing application inputs, outputs and mappings

module.exports = {
    pathToApplications: __dirname + '/applications',
    
    transports: {
      osc : {
        remoteControlPort: 12000,
      },
      zmq: {}
      // websocket: {
      //   webServerPort: 9080
      // }
    },
    
    IO : {
      gui : {
        // serve files to directory inside interface.server.gui repo
        interfaceDirectory: __dirname + '/node_modules/interface.server.gui/interfaces',
        appendID:false,
        webServerPort: 10080,
      },
      // phasespace : {},
      spacenavigator: { rate:10 },
      gamepad: {},
      keyboard : {},
      mouse:{}
    }
}