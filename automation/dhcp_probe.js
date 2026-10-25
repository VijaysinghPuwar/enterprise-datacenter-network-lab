eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
function keys(o) { var a = []; try { for (var k in o) a.push(k); } catch (e) {} return a.join(","); }
var dh = dev("SVC-DNS").getProcess("DhcpServerMainProcess").getDhcpServerProcessByPortName("FastEthernet0");
log("enabled " + dh.isEnable() + " pools " + dh.getPoolCount());
for (var i = 0; i < dh.getPoolCount(); i++) {
  var p = dh.getPoolAt(i);
  log("pool " + i + " keys: " + keys(p));
  try { log("  name " + p.getDhcpPoolName() + " net " + p.getNetworkAddress() + " mask " + p.getSubnetMask() + " start " + p.getStartIp() + " end " + p.getEndIp() + " gw " + p.getDefaultRouter() + " dns " + p.getDnsServerIp() + " max " + p.getMaxUsers()); } catch (e) { log("  getter err " + e); }
}
flushLog("automation/logs/dhcp_probe.log");
