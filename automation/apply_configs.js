// ============================================================================
//  Advanced Data Center - configuration push (Packet Tracer 9.0 Script Engine)
//  Feeds each lab-support/configs/<DEVICE>.cfg line-by-line into the device CLI,
//  records every rejected command, and writes a transcript per run.
// ============================================================================
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));

var ORDER = ["CORE-1", "CORE-2", "ACC-1", "ACC-2", "DMZ-SW", "INET-R", "ISP1-R", "ISP2-R", "EDGE-R1", "FW-1"];
var TARGETS = (typeof APPLY_ONLY !== "undefined") ? APPLY_ONLY : ORDER;
var PASSWORD = "DcLabOnly2026!";
var ENABLE_FIRST = (typeof FRESH_ENABLE !== "undefined") ? FRESH_ENABLE : false;

function resParts(res) {
  if (res === null || res === undefined) return ["null", ""];
  if (typeof res === "object") {
    try { if (res.length !== undefined) return [String(res[0]), String(res[1])]; } catch (e) {}
    try { return [String(res.first), String(res.second)]; } catch (e) {}
  }
  return ["?", String(res)];
}
function send(d, cmd) {
  var res;
  try { res = d.enterCommand(cmd, ""); } catch (e) { return ["EXC", String(e)]; }
  return resParts(res);
}
var CL_CACHE = {};
function getCL(d) {
  var key = d.getName();
  if (CL_CACHE[key]) return CL_CACHE[key];
  var accessors = ["getCommandLine", "getConsoleLine", "getConsole", "getIpcTerminalLine", "getLine"];
  for (var a = 0; a < accessors.length; a++) {
    try {
      if (typeof d[accessors[a]] !== "function") continue;
      var c = d[accessors[a]]();
      if (c && typeof c.enterCommand === "function" && typeof c.getPrompt === "function") { if (a > 0) log("  terminal via " + accessors[a]); CL_CACHE[key] = c; return c; }
    } catch (e) {}
  }
  return null;
}
function consoleSend(d, cmd) { try { getCL(d).enterCommand(cmd); } catch (e) { log("  console send failed " + e); } }
function handlePrompts(d, name) {
  var cl = getCL(d);
  for (var k = 0; k < 6; k++) {
    var pr = String(cl.getPrompt());
    if (pr.indexOf("initial configuration dialog") >= 0) { consoleSend(d, "no"); consoleSend(d, ""); log("  " + name + ": answered initial dialog -> '" + cl.getPrompt() + "'"); continue; }
    if (pr.indexOf("Username:") >= 0) { consoleSend(d, "netadmin"); consoleSend(d, PASSWORD); log("  " + name + ": console login"); continue; }
    if (pr.indexOf("Password:") >= 0) { consoleSend(d, PASSWORD); log("  " + name + ": password prompt answered"); continue; }
    if (pr.indexOf("[yes/no]") >= 0) { consoleSend(d, "no"); log("  " + name + ": answered yes/no prompt with no"); continue; }
    if (pr.replace(/\s+/g, "") === "") { consoleSend(d, ""); continue; }
    break;
  }
  log("  " + name + ": ready prompt '" + cl.getPrompt() + "'");
}

var summary = [];
for (var i = 0; i < TARGETS.length; i++) {
  var name = TARGETS[i], d = dev(name);
  if (!d) { log("MISSING DEVICE " + name); continue; }
  try { if (typeof d.skipBoot === "function") d.skipBoot(); } catch (e) {}
  var cl = getCL(d);
  if (!cl) { log("NO TERMINAL for " + name); continue; }
  log("=== " + name + " start prompt: '" + cl.getPrompt() + "'");
  handlePrompts(d, name);
  var src = (typeof CFG_OVERRIDE !== "undefined" && CFG_OVERRIDE[name]) ? CFG_OVERRIDE[name] : ("lab-support/configs/" + name + ".cfg");
  log("  source " + src);
  var lines = String(readFile(src)).split(/\r?\n/);
  var errs = 0, sent = 0, diag = 0;
  var transcript = [];
  for (var j = 0; j < lines.length; j++) {
    var line = lines[j];
    if (!line.replace(/\s+/g, "")) continue;
    var before = String(cl.getOutput());
    consoleSend(d, line);
    sent++;
    var after = String(cl.getOutput());
    var delta;
    if (after.length >= before.length && after.substring(0, before.length) === before) delta = after.substring(before.length);
    else {  // console buffer was trimmed: re-anchor on the last 200 chars seen before this command
      var tail = before.substring(Math.max(0, before.length - 200));
      var idx = after.lastIndexOf(tail);
      delta = idx >= 0 ? after.substring(idx + tail.length) : after.substring(Math.max(0, after.length - 300));
    }
    transcript.push(cl.getPrompt() + " | " + line + (delta.replace(/\s+/g, "") ? "\n    " + delta.replace(/\n/g, "\n    ") : ""));
    if (diag < 3) { log("  diag '" + line + "' outLen " + before.length + "->" + after.length + " delta='" + delta.replace(/\s+/g, " ").substring(0, 160) + "'"); diag++; }
    var pr = String(cl.getPrompt());
    if (line === "enable" && pr.indexOf("Password") >= 0) { consoleSend(d, ENABLE_FIRST ? "" : PASSWORD); pr = String(cl.getPrompt()); if (pr.indexOf("Password") >= 0) { consoleSend(d, ""); pr = String(cl.getPrompt()); } }
    if (pr.indexOf("[yes/no]") >= 0 || pr.indexOf("[confirm]") >= 0) {
      log("  prompt after '" + line + "': " + pr); consoleSend(d, pr.indexOf("[yes/no]") >= 0 ? "no" : "");
    }
    if (/% ?Invalid|% ?Incomplete|% ?Ambiguous|ERROR:|% ?Unrecognized|not supported|% ?Unknown/i.test(delta)) {
      errs++;
      log("  REJECTED line " + (j + 1) + ": " + line + "  =>  " + delta.replace(/\s+/g, " ").substring(0, 220));
    }
  }
  writeFile("automation/logs/transcript_" + name + (typeof RUN_TAG !== "undefined" ? RUN_TAG : "") + ".txt", transcript.join("\n") + "\n");
  log("=== " + name + " sent=" + sent + " rejected=" + errs + " final prompt '" + cl.getPrompt() + "'");
  summary.push(name + ": sent " + sent + ", rejected " + errs);
}
log("SUMMARY\n" + summary.join("\n"));
flushLog("automation/logs/apply_configs_" + TARGETS.join("_") + (typeof RUN_TAG !== "undefined" ? RUN_TAG : "") + ".log");
