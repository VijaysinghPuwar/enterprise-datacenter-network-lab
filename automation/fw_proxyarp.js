// PT model equivalent of "sysopt noproxyarp <if>" (CLI not implemented on the PT 9 ASA): disable proxy ARP on ASA data ports.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var ports = ["GigabitEthernet1/1", "GigabitEthernet1/2", "GigabitEthernet1/3", "GigabitEthernet1/4"];
for (var i = 0; i < ports.length; i++) {
  var p = dev("FW-1").getPort(ports[i]);
  var before = "?"; try { before = p.isProxyArpEnabled(); } catch (e) { before = "n/a " + e; }
  if (ports[i] === "GigabitEthernet1/4" || ports[i] === "GigabitEthernet1/2") { try { p.setProxyArpEnabled(false); } catch (e) { log("set failed " + e); } }
  var after = "?"; try { after = p.isProxyArpEnabled(); } catch (e) { after = "n/a"; }
  log("FW-1 " + ports[i] + " proxyArp before=" + before + " after=" + after);
}
flushLog("automation/logs/fw_proxyarp.log");
