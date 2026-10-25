// Shared helpers for the Packet Tracer build scripts (PT 9.0 IPC API).
var LW = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
var NET = ipc.network();
var SFM = ipc.systemFileManager();
var BASE = "/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/";
var LOG = [];
function log(s) { s = String(s); LOG.push(s); try { dprint(s); } catch (e) {} }
function writeFile(rel, text) {
  var p = BASE + rel;
  try { SFM.writePlainTextToFile(p, text); return; } catch (e) {}
  try { SFM.writeTextToFile(p, text); } catch (e2) { log("writeFile failed " + p + " " + e2); }
}
function flushLog(rel) { writeFile(rel, LOG.join("\n") + "\n"); }
function readFile(rel) { return SFM.getFileContents(BASE + rel); }
function dev(name) { return NET.getDevice(name); }
