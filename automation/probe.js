// Packet Tracer Script Engine API probe
var OUT = [];
function log(s) { OUT.push(String(s)); try { dprint(String(s)); } catch (e) {} }
function probe() {
  log("typeof ipc=" + (typeof ipc));
  var lw = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
  log("lw ok: " + (typeof lw.addDevice) + " createLink:" + (typeof lw.createLink));
  var models = ["2911", "ISR4331", "5506-X", "3560-24PS", "2960-24TT", "Server-PT", "PC-PT"];
  var x = 100;
  for (var m = 0; m < models.length; m++) {
    var found = -1, nm = "";
    for (var t = 0; t < 60; t++) {
      try { nm = lw.addDevice(t, models[m], x, 600); } catch (e) { nm = ""; }
      if (nm && nm.length > 0) { found = t; break; }
    }
    log("model " + models[m] + " -> type " + found + " name '" + nm + "'");
    x += 90;
  }
  var net = ipc.network();
  log("deviceCount=" + net.getDeviceCount());
  try {
    var d = net.getDevice("PC0");
    log("PC0 methods: setName=" + typeof d.setName + " getCommandLine=" + typeof d.getCommandLine + " enterCommand=" + typeof d.enterCommand + " skipBoot=" + typeof d.skipBoot + " setDefaultGateway=" + typeof d.setDefaultGateway + " setDhcpFlag=" + typeof d.setDhcpFlag + " setDnsServerIp=" + typeof d.setDnsServerIp + " getPort=" + typeof d.getPort + " getPortAt=" + typeof d.getPortAt + " getPortCount=" + typeof d.getPortCount);
  } catch (e) { log("PC0 err " + e); }
}
try { probe(); } catch (e) { log("ERR " + e); }
