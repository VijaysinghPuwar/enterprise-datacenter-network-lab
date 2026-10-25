// Drill runner. STEP = start | fault | collect | restore | verify
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
eval(readFile("automation/drills.js"));
var D = DRILLS[DRILL], tag = DRILL + (typeof DRILL_SUFFIX !== "undefined" ? DRILL_SUFFIX : "");
function simt() { try { return ipc.simulation().getCurrentSimTime(); } catch (e) { return "?"; } }
function cmdFor(sid, n) { return "ping -n " + n + " " + STREAMS_ALL[sid].dst; }
function applyActions(list, label) {
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    if (a[0] === "POWER") { dev(a[1]).setPower(a[2]); log(label + ": " + a[1] + " power " + (a[2] ? "ON" : "OFF") + " @sim " + simt()); continue; }
    var d = dev(a[0]); ensurePriv(d);
    for (var j = 0; j < a[1].length; j++) run(d, a[1][j]);
    log(label + ": " + a[0] + " :: " + a[1].join(" ; ") + " @sim " + simt());
  }
}
function collect(phase, n) {
  var rows = [], detail = [], tot = {sent: 0, rec: 0};
  for (var i = 0; i < D.streams.length; i++) {
    var sid = D.streams[i], s = STREAMS_ALL[sid], cmd = cmdFor(sid, n);
    var out = String(dev(s.src).getCommandLine().getOutput());
    var idx = out.lastIndexOf(cmd), seg = idx >= 0 ? out.substring(idx) : "(not found)";
    var m = seg.match(/Sent = (\d+), Received = (\d+), Lost = (\d+)/);
    var replies = (seg.match(/Reply from/g) || []).length, timeouts = (seg.match(/Request timed out|Destination host unreachable/g) || []).length;
    var res;
    if (m) {
      var sent = +m[1], rec = +m[2];
      res = "sent=" + sent + " received=" + rec + " lost=" + m[3] + " (" + Math.round(100 * rec / Math.max(1, sent)) + "% delivered)";
      if (s.expect === "permit") { tot.sent += sent; tot.rec += rec; }
    } else res = "IN PROGRESS replies=" + replies + " timeouts=" + timeouts;
    rows.push(sid + " | " + s.desc + " | " + s.src + " -> " + s.dst + " | expect " + s.expect + " | " + res);
    detail.push("### " + sid + " " + s.src + "> " + cmd + "\n" + seg);
  }
  rows.push("TOTAL permitted-stream delivery: " + tot.rec + "/" + tot.sent);
  writeFile("lab-support/evidence/raw/drills/" + tag + "_" + phase + ".txt", "Drill " + tag + " phase " + phase + " collected @sim " + simt() + "\n" + rows.join("\n") + "\n\n" + detail.join("\n\n") + "\n");
  log(rows.join("\n"));
}
if (STEP === "start") {
  for (var i = 0; i < D.streams.length; i++) { var sid = D.streams[i]; dev(STREAMS_ALL[sid].src).getCommandLine().enterCommand(cmdFor(sid, D.count)); }
  log("started " + D.streams.length + " streams x " + D.count + " @sim " + simt());
} else if (STEP === "fault") {
  applyActions(D.fault, "FAULT");
} else if (STEP === "shows") {
  var out = [];
  for (var i = 0; i < D.shows.length; i++) { var d = dev(D.shows[i][0]); if (!d.getPower || d.getPower()) { ensurePriv(d); out.push("### " + D.shows[i][0] + "# " + D.shows[i][1] + "\n" + run(d, D.shows[i][1])); } }
  writeFile("lab-support/evidence/raw/drills/" + tag + "_shows_" + (typeof SHOW_PHASE !== "undefined" ? SHOW_PHASE : "fault") + ".txt", out.join("\n") + "\n");
  log("captured " + out.length + " shows");
} else if (STEP === "collect") {
  collect("during", D.count);
} else if (STEP === "restore") {
  applyActions(D.restore, "RESTORE");
} else if (STEP === "verify") {
  for (var i = 0; i < D.streams.length; i++) { var sid = D.streams[i]; dev(STREAMS_ALL[sid].src).getCommandLine().enterCommand(cmdFor(sid, 8)); }
  log("verify pings started @sim " + simt());
} else if (STEP === "verify_collect") {
  collect("after_restore", 8);
}
flushLog("automation/logs/drill_" + tag + "_" + STEP + ".log");
