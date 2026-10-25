// Export the final running configuration of every network device (as-built source of truth).
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var DEVS = ["CORE-1", "CORE-2", "ACC-1", "ACC-2", "DMZ-SW", "FW-1", "EDGE-R1", "ISP1-R", "ISP2-R", "INET-R"];
for (var i = 0; i < DEVS.length; i++) {
  var d = dev(DEVS[i]); ensurePriv(d);
  var o = run(d, "show running-config");
  o = o.replace(/^show running-config\s*/, "").replace(/\n[^\n]*#\s*$/, "\n");
  writeFile("lab-support/evidence/final-running-configs/" + DEVS[i] + ".running-config.txt", o);
  var lines = o.split("\n").length;
  log(DEVS[i] + " lines=" + lines + " ends=" + JSON.stringify(o.substring(Math.max(0, o.length - 40))));
}
flushLog("automation/logs/export_configs.log");
