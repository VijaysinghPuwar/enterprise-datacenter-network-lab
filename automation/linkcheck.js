eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
log("links " + NET.getLinkCount());
var p = dev("FW-1").getPort("GigabitEthernet1/4");
log("FW-1 Gi1/4 link: " + (p ? p.getLink() : "no port") + " remote " + (p ? p.getRemotePortName() : ""));
var q = dev("CORE-2").getPort("FastEthernet0/24");
log("CORE-2 Fa0/24 link: " + (q ? q.getLink() : "no port"));
if (!p.getLink()) {
  var r2 = LW.createLink("CORE-2", "FastEthernet0/24", "FW-1", "GigabitEthernet1/4", 8100);
  log("retry reversed => " + r2);
  if (!r2) { var r3 = LW.createLink("FW-1", "GigabitEthernet1/4", "CORE-2", "FastEthernet0/24", 8101); log("retry crossover => " + r3); }
}
log("links now " + NET.getLinkCount());
flushLog("automation/logs/linkcheck.log");
