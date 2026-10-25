eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var junk = ["Router0", "Router1", "ASA0", "Multilayer Switch0", "Switch0", "Server0", "PC0", "Power Distribution Device0", "Power Distribution Device2"];
for (var i = 0; i < junk.length; i++) { if (dev(junk[i])) { LW.removeDevice(junk[i]); log("removed " + junk[i]); } else log("absent " + junk[i]); }
log("devices now " + NET.getDeviceCount() + " links " + NET.getLinkCount());
var names = []; for (var i = 0; i < NET.getDeviceCount(); i++) names.push(NET.getDeviceAt(i).getName());
log(names.sort().join(", "));
flushLog("automation/logs/cleanup_probe.log");
