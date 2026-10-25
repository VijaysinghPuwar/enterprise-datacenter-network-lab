// Change 2 (redundancy): move FW-1 inside/db attachments from the cores to the dual-homed ToRs so either core can fail.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
function unlink(devName, portName) {
  var p = dev(devName).getPort(portName);
  try { if (p.getLink()) { p.deleteLink(); log("deleted link on " + devName + " " + portName); } } catch (e) { log("deleteLink failed " + devName + " " + portName + " " + e); }
}
unlink("FW-1", "GigabitEthernet1/2");
unlink("FW-1", "GigabitEthernet1/4");
log("L7  FW-1 Gi1/2 <-> ACC-1 Fa0/24 => " + LW.createLink("FW-1", "GigabitEthernet1/2", "ACC-1", "FastEthernet0/24", 8100));
log("L26 FW-1 Gi1/4 <-> ACC-2 Fa0/24 => " + LW.createLink("FW-1", "GigabitEthernet1/4", "ACC-2", "FastEthernet0/24", 8100));
log("links now " + NET.getLinkCount() + "; FW-1 Gi1/2 remote " + dev("FW-1").getPort("GigabitEthernet1/2").getRemotePortName());
function exec(name, cmds) {
  var d = dev(name); ensurePriv(d);
  for (var j = 0; j < cmds.length; j++) { var o = run(d, cmds[j]); if (/Invalid|Incomplete|Ambiguous|ERROR/.test(o)) log(name + " REJECT " + cmds[j] + " => " + o.replace(/\s+/g, " ").substring(0, 160)); }
  log(name + " applied " + cmds.length + " lines");
}
var PARK = ["description UNUSED-PARKED", "switchport mode access", "switchport access vlan 999", "shutdown"];
var ADD900 = ["switchport trunk allowed vlan add 900"];
exec("CORE-1", ["configure terminal", "interface FastEthernet0/1"].concat(ADD900).concat(["interface FastEthernet0/2"]).concat(ADD900).concat(["interface FastEthernet0/24"]).concat(PARK).concat(["end", "write memory"]));
exec("CORE-2", ["configure terminal", "interface FastEthernet0/1"].concat(ADD900).concat(["interface FastEthernet0/2"]).concat(ADD900).concat(["interface FastEthernet0/24"]).concat(PARK).concat(["end", "write memory"]));
var TOR = ["configure terminal", "vlan 900", "name FW-TRANSIT", "exit", "interface GigabitEthernet0/1"].concat(ADD900).concat(["interface GigabitEthernet0/2"]).concat(ADD900);
exec("ACC-1", TOR.concat(["interface FastEthernet0/24", "description FW-1-INSIDE", "switchport mode access", "switchport access vlan 900", "spanning-tree portfast", "no shutdown", "end", "write memory"]));
exec("ACC-2", TOR.concat(["interface FastEthernet0/24", "description FW-1-DB-ZONE", "switchport mode access", "switchport access vlan 40", "spanning-tree portfast", "no shutdown", "end", "write memory"]));
exec("FW-1", ["configure terminal", "route inside 10.10.10.0 255.255.255.0 10.255.0.1", "route inside 10.10.20.0 255.255.255.0 10.255.0.1",
  "route inside 10.10.30.0 255.255.255.0 10.255.0.1", "route inside 10.10.50.0 255.255.255.0 10.255.0.1", "end", "write memory"]);
flushLog("automation/logs/rewire_fw.log");
