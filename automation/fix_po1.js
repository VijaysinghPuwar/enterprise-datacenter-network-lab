// Re-negotiate LACP Po1 on both cores (members were suspended because CORE-1 came up before CORE-2 was configured)
// and test the documented "logging trap debugging" variant on the internal switches.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var cores = ["CORE-1", "CORE-2"];
for (var i = 0; i < cores.length; i++) {
  var d = dev(cores[i]); ensurePriv(d);
  var seq = ["configure terminal", "interface range GigabitEthernet0/1 - 2", "shutdown", "no shutdown", "end"];
  for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|Incomplete/.test(o)) log(cores[i] + " REJECT " + seq[j] + " => " + o); }
  log(cores[i] + " Po1 members bounced");
}
var sw = ["CORE-1", "CORE-2", "ACC-1", "ACC-2"];
for (var i = 0; i < sw.length; i++) {
  var d = dev(sw[i]); ensurePriv(d);
  run(d, "configure terminal");
  var o = run(d, "logging trap debugging");
  log(sw[i] + " 'logging trap debugging' => " + (/Invalid|Incomplete/.test(o) ? "REJECTED " + o.replace(/\s+/g, " ") : "accepted"));
  run(d, "end");
  var w = run(d, "write memory");
  log(sw[i] + " write memory => " + w.replace(/\s+/g, " ").substring(0, 80));
}
var t = run(dev("CORE-1"), "show ip interface brief");
log("paging test length " + t.length + " has More: " + (t.indexOf("--More--") >= 0) + " ends with: " + t.substring(t.length - 120).replace(/\s+/g, " "));
flushLog("automation/logs/fix_po1.log");
