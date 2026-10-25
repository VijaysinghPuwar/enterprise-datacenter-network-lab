eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var cores = ["CORE-1", "CORE-2"];
for (var i = 0; i < cores.length; i++) {
  var d = dev(cores[i]); ensurePriv(d);
  var seq = ["configure terminal", "interface Vlan40", "ip access-group DB-PROTECT out", "end", "write memory"];
  for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|Incomplete/.test(o)) log(cores[i] + " REJECT " + seq[j] + " " + o); }
  log(cores[i] + ": " + run(d, "show ip interface Vlan40").split("\n").filter(function (l) { return /access list/.test(l); }).join(" | "));
}
flushLog("automation/logs/acl_fix.log");
