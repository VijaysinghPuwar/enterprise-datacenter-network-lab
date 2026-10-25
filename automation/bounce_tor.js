eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var tors = ["ACC-1", "ACC-2"];
for (var i = 0; i < tors.length; i++) { var d = dev(tors[i]); ensurePriv(d); var s = ["configure terminal", "interface range GigabitEthernet0/1 - 2", "shutdown", "end"]; for (var j = 0; j < s.length; j++) run(d, s[j]); }
for (var i = 0; i < tors.length; i++) { var d = dev(tors[i]); ensurePriv(d); var s = ["configure terminal", "interface range GigabitEthernet0/1 - 2", "no shutdown", "end"]; for (var j = 0; j < s.length; j++) run(d, s[j]); }
log("ToR uplinks bounced");
flushLog("automation/logs/bounce_tor.log");
