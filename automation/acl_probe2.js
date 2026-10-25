eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("CORE-2"); ensurePriv(d);
var seq = ["configure terminal", "no ip access-list extended WEB-TIER-IN",
  "access-list 140 deny ip 10.10.20.0 0.0.0.255 10.10.40.0 0.0.0.255", "access-list 140 permit ip any any",
  "interface Vlan40", "ip access-group 140 out", "exit",
  "vlan access-map PROBE 10", "exit", "end"];
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); log("> " + seq[j] + " :: " + o.replace(/\s+/g, " ").substring(0, 140)); }
var r = run(d, "show running-config");
var m = r.match(/interface Vlan40[\s\S]*?!/);
log("Vlan40 section: " + (m ? m[0] : "n/a"));
log("has access-map: " + (r.indexOf("access-map") >= 0));
// cleanup probe
var clean = ["configure terminal", "interface Vlan40", "no ip access-group 140 out", "exit", "no access-list 140", "end"];
for (var j = 0; j < clean.length; j++) run(d, clean[j]);
flushLog("automation/logs/acl_probe2.log");
