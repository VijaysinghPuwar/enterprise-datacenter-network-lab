eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("CORE-2"); ensurePriv(d);
log(run(d, "show running-config | include access-group"));
var seq = ["configure terminal", "interface Vlan40", "ip access-group DB-PROTECT out", "exit", "ip access-list extended WEB-TIER-IN",
  "remark Web tier may not open sessions to the DB tier (PT 3560 does not bind outbound SVI ACLs)",
  "permit tcp 10.10.20.0 0.0.0.255 10.10.40.0 0.0.0.255 established",
  "permit icmp 10.10.20.0 0.0.0.255 10.10.40.0 0.0.0.255 echo-reply",
  "deny ip 10.10.20.0 0.0.0.255 10.10.40.0 0.0.0.255",
  "permit ip any any", "exit", "interface Vlan20", "ip access-group WEB-TIER-IN in", "end"];
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); log("> " + seq[j] + " :: " + o.replace(/\s+/g, " ").substring(0, 160)); }
log(run(d, "show ip interface Vlan20"));
log(run(d, "show ip interface Vlan40"));
flushLog("automation/logs/acl_probe.log");
