// Change 3: return to OSPF next-hops on FW-1 (PT ASA ARPs per-host via the HSRP VIP static routes and the core
// proxy-ARPs with its physical MAC -> stale after core loss). Faster OSPF on transit VLAN 900; no proxy-arp on transit SVIs.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
function exec(name, cmds) {
  var d = dev(name); ensurePriv(d); var rej = [];
  for (var j = 0; j < cmds.length; j++) { var o = run(d, cmds[j]); if (/Invalid|Incomplete|Ambiguous|ERROR/.test(o)) rej.push(cmds[j]); }
  log(name + " applied " + cmds.length + " lines; rejected: " + (rej.length ? rej.join(" | ") : "none"));
  return rej;
}
var asaRej = exec("FW-1", ["configure terminal", "no route inside 10.10.10.0 255.255.255.0 10.255.0.1", "no route inside 10.10.20.0 255.255.255.0 10.255.0.1",
  "no route inside 10.10.30.0 255.255.255.0 10.255.0.1", "no route inside 10.10.50.0 255.255.255.0 10.255.0.1",
  "interface GigabitEthernet1/2", "ospf hello-interval 1", "ospf dead-interval 3", "end"]);
var asaTimersOk = asaRej.join(" ").indexOf("ospf") < 0;
log("ASA OSPF timers accepted: " + asaTimersOk);
var coreCmds = ["configure terminal", "interface Vlan900", "no ip proxy-arp"];
if (asaTimersOk) coreCmds = coreCmds.concat(["ip ospf hello-interval 1", "ip ospf dead-interval 3"]);
coreCmds = coreCmds.concat(["end", "write memory"]);
exec("CORE-1", coreCmds); exec("CORE-2", coreCmds);
exec("FW-1", ["clear arp", "write memory"]);
flushLog("automation/logs/ospf_fast.log");
