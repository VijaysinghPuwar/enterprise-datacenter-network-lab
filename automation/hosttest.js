// Host-side test harness. MODE "start" launches commands on endpoint command prompts in parallel;
// MODE "collect" parses the results (ping statistics) and writes evidence files.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
function hostCL(name) { return dev(name).getCommandLine(); }
var tag = TEST_TAG;
if (MODE === "start") {
  for (var i = 0; i < STREAMS.length; i++) {
    var s = STREAMS[i];
    hostCL(s.src).enterCommand(s.cmd);
    log("started " + s.id + "  " + s.src + "> " + s.cmd);
  }
  flushLog("automation/logs/hosttest_" + tag + "_start.log");
} else {
  var rows = [], detail = [];
  for (var i = 0; i < STREAMS.length; i++) {
    var s = STREAMS[i];
    var out = String(hostCL(s.src).getOutput());
    var idx = out.lastIndexOf(s.cmd);
    var seg = idx >= 0 ? out.substring(idx) : "(command not found in buffer)";
    var m = seg.match(/Sent = (\d+), Received = (\d+), Lost = (\d+)/);
    var res;
    if (m) {
      var sent = +m[1], rec = +m[2];
      var pass = s.expect === "deny" ? (rec === 0) : (rec > 0);
      res = (pass ? "PASS" : "FAIL") + " sent=" + sent + " received=" + rec + " lost=" + m[3] + " (" + Math.round(100 * rec / Math.max(sent, 1)) + "% success)";
    } else if (s.cmd.indexOf("ping") === 0) res = "RUNNING/INCOMPLETE";
    else res = "OUTPUT CAPTURED";
    rows.push(s.id + " | " + s.src + " -> " + s.cmd + " | expect " + s.expect + " | " + res);
    detail.push("### " + s.id + "  " + s.src + "> " + s.cmd + "  [expect " + s.expect + "]\n" + seg + "\n");
  }
  writeFile("lab-support/evidence/raw/tests/" + tag + ".txt", rows.join("\n") + "\n\n" + detail.join("\n"));
  log(rows.join("\n"));
  flushLog("automation/logs/hosttest_" + tag + "_collect.log");
}
