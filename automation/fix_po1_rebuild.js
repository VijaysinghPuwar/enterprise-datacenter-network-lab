// Rebuild LACP Po1 between CORE-1 and CORE-2: members down on both sides, recreate Po1 first,
// re-add members (inherit Po1 trunk settings), then bring both sides up together.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var cores = ["CORE-1", "CORE-2"];
function exec(name, cmds) {
  var d = dev(name); ensurePriv(d);
  for (var j = 0; j < cmds.length; j++) {
    var o = run(d, cmds[j]);
    if (/Invalid|Incomplete|Ambiguous|% /.test(o)) log(name + " :: " + cmds[j] + " => " + o.replace(/\s+/g, " ").substring(0, 200));
  }
}
var TRUNK = ["switchport trunk encapsulation dot1q", "switchport mode trunk", "switchport trunk native vlan 99",
             "switchport trunk allowed vlan 10,20,30,40,50,99,900", "switchport nonegotiate"];
for (var i = 0; i < cores.length; i++) exec(cores[i], ["configure terminal", "interface range GigabitEthernet0/1 - 2", "shutdown", "no channel-group", "exit", "no interface Port-channel1", "end"]);
for (var i = 0; i < cores.length; i++) exec(cores[i], ["configure terminal", "interface Port-channel1"].concat(TRUNK).concat(["exit", "interface range GigabitEthernet0/1 - 2"]).concat(TRUNK).concat(["channel-group 1 mode active", "exit", "end"]));
for (var i = 0; i < cores.length; i++) exec(cores[i], ["configure terminal", "interface range GigabitEthernet0/1 - 2", "no shutdown", "end", "write memory"]);
log("rebuild done");
flushLog("automation/logs/fix_po1_rebuild.log");
