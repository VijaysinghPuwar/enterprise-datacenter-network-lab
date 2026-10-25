// Optimization: HSRPv2 hello 1 s / hold 3 s (default 3/10) for faster first-hop failover.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var groups = [10, 20, 30, 50, 900];
var cores = ["CORE-1", "CORE-2"];
for (var c = 0; c < cores.length; c++) {
  var d = dev(cores[c]); ensurePriv(d); run(d, "configure terminal");
  for (var g = 0; g < groups.length; g++) {
    run(d, "interface Vlan" + groups[g]);
    var o = run(d, "standby " + groups[g] + " timers 1 3");
    if (/Invalid|Incomplete/.test(o)) log(cores[c] + " REJECT timers g" + groups[g] + " " + o.replace(/\s+/g, " "));
  }
  run(d, "end"); run(d, "write memory");
  log(cores[c] + " HSRP timers 1/3 applied");
}
log(run(dev("CORE-1"), "show standby Vlan10"));
flushLog("automation/logs/hsrp_tune.log");
