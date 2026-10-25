// Persistence audit after closing and reopening Advanced-DataCenter.pkt (B14).
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var out = [];
function cap(name, cmd) { var d = dev(name); ensurePriv(d); out.push("### " + name + "# " + cmd + "\n" + run(d, cmd)); }
var ports = ["GigabitEthernet1/1", "GigabitEthernet1/2", "GigabitEthernet1/3", "GigabitEthernet1/4"];
for (var i = 0; i < ports.length; i++) { var p = dev("FW-1").getPort(ports[i]); out.push("FW-1 " + ports[i] + " proxyArp=" + p.isProxyArpEnabled() + " up=" + p.isPortUp()); }
cap("FW-1", "show interface ip brief");
cap("FW-1", "show route");
cap("CORE-1", "show etherchannel summary");
cap("CORE-1", "show standby brief");
cap("CORE-2", "show standby brief");
cap("CORE-1", "show ip ospf neighbor");
cap("EDGE-R1", "show ip bgp summary");
var dns = dev("SVC-DNS").getProcess("DnsServer");
out.push("SVC-DNS dns enabled=" + dns.isEnabled() + " records=" + dns.getSizeOfNameServerDb());
var dh = dev("SVC-DNS").getProcess("DhcpServerMainProcess").getDhcpServerProcessByPortName("FastEthernet0");
out.push("SVC-DNS dhcp enabled=" + dh.isEnable() + " pools=" + dh.getPoolCount());
out.push("WEB-01 http index length=" + String(dev("WEB-01").getProcess("HttpServer").getPage("index.html")).length);
out.push("SVC-MON syslog=" + dev("SVC-MON").getProcess("SyslogServer").isEnabled() + " ntp=" + dev("SVC-MON").getProcess("NtpServer").isEnabled());
out.push("devices=" + NET.getDeviceCount() + " links=" + NET.getLinkCount());
writeFile("lab-support/evidence/raw/reopen/final_reopen_audit.txt", out.join("\n") + "\n");
