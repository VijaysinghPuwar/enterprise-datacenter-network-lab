// Robust long-output capture: read page by page so PT's console buffer trimming cannot drop the top of a long output.
// Used to re-export ACC-1 (first export was truncated at the top) and to capture full HSRP detail from both cores.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
function captureLong(d, cmd) {
  var cl = getCL(d);
  var last = String(cl.getOutput());
  var acc = "";
  cl.enterCommand(cmd);
  for (var k = 0; k < 300; k++) {
    var cur = String(cl.getOutput());
    var tail = last.substring(Math.max(0, last.length - 600));
    var idx = tail.length ? cur.lastIndexOf(tail) : -1;
    acc += (idx >= 0) ? cur.substring(idx + tail.length) : cur;
    last = cur;
    if (/(--More--|<--- More --->)\s*$/.test(cur)) { try { cl.enterChar(32, 0); } catch (e) { cl.enterCommand(" "); } continue; }
    break;
  }
  return acc.replace(/ ?(--More--|<--- More --->)[\b \x08]*/g, "");
}
var out = [];
var acc1 = dev("ACC-1"); ensurePriv(acc1);
var cfg = captureLong(acc1, "show running-config").replace(/^show running-config\s*/, "").replace(/\n[^\n]*#\s*$/, "\n");
var ok = /hostname ACC-1/.test(cfg) && /\nend\s*$/.test(cfg);
log("ACC-1 export chars=" + cfg.length + " complete=" + ok);
if (ok) writeFile("lab-support/evidence/final-running-configs/ACC-1.running-config.txt", cfg);
else writeFile("lab-support/evidence/final-running-configs/ACC-1.running-config.RETRY-INCOMPLETE.txt", cfg);
var cores = ["CORE-1", "CORE-2"];
for (var i = 0; i < cores.length; i++) {
  var d = dev(cores[i]); ensurePriv(d);
  out.push("### " + cores[i] + "# show standby\n" + captureLong(d, "show standby"));
}
writeFile("lab-support/evidence/raw/tests/show_hsrp_detail_final.txt", out.join("\n") + "\n");
flushLog("automation/logs/export_fix.log");
