// Optimization: FW-1 is single-attached to CORE-1, so make CORE-1 its preferred return path for all inside prefixes.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("CORE-2"); ensurePriv(d); run(d, "configure terminal");
var svis = ["Vlan10", "Vlan20", "Vlan30", "Vlan50"];
for (var i = 0; i < svis.length; i++) { run(d, "interface " + svis[i]); var o = run(d, "ip ospf cost 100"); if (/Invalid|Incomplete/.test(o)) log("REJECT " + svis[i] + " " + o); }
run(d, "end"); run(d, "write memory");
log("CORE-2 passive SVI OSPF cost 100 applied");
flushLog("automation/logs/ospf_tune.log");
