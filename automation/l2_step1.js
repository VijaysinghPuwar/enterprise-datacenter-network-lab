eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var cores = ["CORE-1", "CORE-2"];
for (var i = 0; i < cores.length; i++) {
  var d = dev(cores[i]); ensurePriv(d);
  var seq = ["configure terminal", "interface range GigabitEthernet0/1 - 2", "shutdown", "end"];
  for (var j = 0; j < seq.length; j++) run(d, seq[j]);
  log(cores[i] + " core links shut");
}
flushLog("automation/logs/l2_step1.log");
