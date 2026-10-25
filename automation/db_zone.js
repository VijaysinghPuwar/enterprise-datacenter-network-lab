// Change 1: DB tier becomes an ASA security zone (PT 3560 does not install SVI ACLs or VACLs).
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var r = LW.createLink("FW-1", "GigabitEthernet1/4", "CORE-2", "FastEthernet0/24", 8100);
log("link L26 FW-1 Gi1/4 <-> CORE-2 Fa0/24 straight => " + r);
function exec(name, cmds) {
  var d = dev(name); ensurePriv(d);
  for (var j = 0; j < cmds.length; j++) {
    var o = run(d, cmds[j]);
    var pr = prompt(d);
    if (pr.indexOf("[yes/no]") >= 0 || pr.indexOf("[confirm]") >= 0) rawSend(d, "");
    if (/Invalid|Incomplete|Ambiguous|ERROR/.test(o)) log(name + " REJECT " + cmds[j] + " => " + o.replace(/\s+/g, " ").substring(0, 200));
  }
  log(name + " applied " + cmds.length + " lines");
}
exec("CORE-2", ["configure terminal", "interface FastEthernet0/24", "description FW-1-DB-ZONE", "switchport mode access",
  "switchport access vlan 40", "spanning-tree portfast", "no shutdown", "exit", "no interface Vlan40",
  "no ip access-list extended DB-PROTECT", "no ip access-list extended WEB-TIER-IN", "end", "write memory"]);
exec("CORE-1", ["configure terminal", "no interface Vlan40", "no ip access-list extended DB-PROTECT", "end", "write memory"]);
exec("FW-1", String(readFile("automation/pt-adjusted/FW-1-db-zone.cfg")).split(/\r?\n/).filter(function (l) { return l.replace(/\s+/g, ""); }));
log(run(dev("FW-1"), "show interface ip brief"));
flushLog("automation/logs/db_zone.log");
