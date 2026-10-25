// Packet Tracer Script Engine loader.
// Import this one file into a PT script module, then "Run File": it evaluates
// automation/task.js from disk so every build/config step is reproducible as code.
var BASE = "/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/";
var SFM = ipc.systemFileManager();
function runFromDisk(rel) { eval(SFM.getFileContents(BASE + rel)); }
try { runFromDisk("automation/task.js"); } catch (e) { try { dprint("RUNNER ERROR " + e); } catch (x) {} }
