// Probe whether PT 9 3560 applies HSRP timer commands (runtime check via "show standby"). Changes are not saved.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("CORE-1"); ensurePriv(d);
function hello() { var o = run(d, "show standby"); var m = o.match(/Vlan10 - Group 10[\s\S]*?Hello time ([^\n]*)/); return m ? m[1] : "(not parsed)"; }
log("before: " + hello());
var variants = ["standby 10 timers 1 3", "standby timers 1 3", "standby 10 timers msec 300 1", "standby version 2"];
for (var i = 0; i < variants.length; i++) {
  run(d, "configure terminal"); run(d, "interface Vlan10");
  var o = run(d, variants[i]).replace(/\s+/g, " ");
  run(d, "end");
  log("after '" + variants[i] + "' -> cli: [" + o.substring(0, 120) + "] hello: " + hello());
}
var o2 = run(d, "show running-config").match(/interface Vlan10[\s\S]*?!/);
log("running-config Vlan10: " + (o2 ? o2[0].replace(/\n/g, " | ") : "(not captured)"));
flushLog("automation/logs/hsrp_probe.log");
