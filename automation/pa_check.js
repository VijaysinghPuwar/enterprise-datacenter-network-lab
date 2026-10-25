// Read (and optionally set) FW-1 proxy-ARP flags. PA_MODE = "set_true" | "read"
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var ports = ["GigabitEthernet1/1", "GigabitEthernet1/2", "GigabitEthernet1/3", "GigabitEthernet1/4"];
for (var i = 0; i < ports.length; i++) {
  var p = dev("FW-1").getPort(ports[i]);
  if (PA_MODE === "set_true" && (ports[i] === "GigabitEthernet1/2" || ports[i] === "GigabitEthernet1/4")) p.setProxyArpEnabled(true);
  log(PA_MODE + " FW-1 " + ports[i] + " proxyArp=" + p.isProxyArpEnabled());
}
log("devices=" + NET.getDeviceCount() + " links=" + NET.getLinkCount() + " time=" + new Date());
flushLog("automation/logs/pa_check_" + PA_MODE + ".log");
