// pathToApplications determines where interface.server looks for
// js files describing application inputs, outputs and mappings

module.exports = {
    "pathToApplications": __dirname + "/applications",
    
    // ports to receive remote control messages for various protocols.
    "remotePortOSC": 12000,
    "remotePort0MQ": 13000,
    "remotePortWebSocket":14000,
    
    // "modules" : [ 
    //   // "interface.server.phasespace",
    //   // "interface.server.gamepad",
    //   "interface.server.keyboard"
    // ]
}