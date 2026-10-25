eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var cores = ["CORE-1", "CORE-2"];
for (var i = 0; i < cores.length; i++) {
  var d = dev(cores[i]); ensurePriv(d);
  var seq = ["configure terminal", "interface range GigabitEthernet0/1 - 2", "no shutdown", "end", "write memory"];
  for (var j = 0; j < seq.length; j++) run(d, seq[j]);
  log(cores[i] + " core links restored + saved");
}
// every network device: make sure startup-config == running-config before the reload test
var all = ["ACC-1", "ACC-2", "DMZ-SW", "INET-R", "ISP1-R", "ISP2-R", "EDGE-R1", "FW-1"];
for (var i = 0; i < all.length; i++) { var d = dev(all[i]); ensurePriv(d); var o = run(d, "write memory"); log(all[i] + " write memory: " + o.replace(/\s+/g, " ").substring(0, 70)); }
log("simtime " + ipc.simulation().getCurrentSimTime());
flushLog("automation/logs/l2_step2.log");
