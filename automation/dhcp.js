// DHCP pool MGMT on SVC-DNS (relayed from CORE-1/CORE-2 Vlan10 ip helper-address)
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var dh = dev("SVC-DNS").getProcess("DhcpServerMainProcess").getDhcpServerProcessByPortName("FastEthernet0");
var p = null;
try { p = dh.getPool("MGMT"); } catch (e) {}
if (!p) {
  var attempts = [
    function () { return dh.addNewPool("MGMT", "10.10.10.1", "10.10.50.10", "10.10.10.100", "255.255.255.0", 50, "0.0.0.0", "0.0.0.0", ""); },
    function () { return dh.addNewPool("MGMT", "10.10.10.0", "255.255.255.0"); },
    function () { return dh.addNewPool("MGMT"); },
    function () { return dh.addPool("MGMT"); }
  ];
  for (var i = 0; i < attempts.length && !p; i++) {
    var before = dh.getPoolCount();
    try { var r = attempts[i](); log("attempt " + i + " => " + r); } catch (e) { log("attempt " + i + " EXC " + e); }
    if (dh.getPoolCount() > before) { try { p = dh.getPool("MGMT"); } catch (e) {} if (!p) p = dh.getPoolAt(dh.getPoolCount() - 1); }
  }
}
if (p) {
  function s(label, fn) { try { fn(); log("set " + label); } catch (e) { log("FAIL " + label + " " + e); } }
  s("network", function () { p.setNetworkAddress("10.10.10.0"); });
  s("mask", function () { p.setNetworkMask("10.10.10.0", "255.255.255.0"); });
  s("mask1", function () { p.setNetworkMask("255.255.255.0"); });
  s("start", function () { p.setStartIp("10.10.10.100"); });
  s("end", function () { p.setEndIp("10.10.10.149"); });
  s("max", function () { p.setMaxUsers(50); });
  s("gw", function () { p.setDefaultRouter("10.10.10.1"); });
  s("dns", function () { p.setDnsServerIp("10.10.50.10"); });
  dh.setEnable(true);
  log("MGMT pool: name " + p.getDhcpPoolName() + " net " + p.getNetworkAddress() + " mask " + p.getSubnetMask() + " start " + p.getStartIp() + " end " + p.getEndIp() + " gw " + p.getDefaultRouter() + " dns " + p.getDnsServerIp() + " max " + p.getMaxUsers() + " | dhcp enabled " + dh.isEnable());
} else log("NO POOL CREATED");
flushLog("automation/logs/dhcp.log");
