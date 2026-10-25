// CLI helpers: console access, login/enable handling, command execution with output capture.
var PASSWORD = "DcLabOnly2026!";
var CL_CACHE = {};
function getCL(d) {
  var key = d.getName();
  if (CL_CACHE[key]) return CL_CACHE[key];
  var acc = ["getCommandLine", "getConsoleLine", "getConsole", "getIpcTerminalLine", "getLine"];
  for (var a = 0; a < acc.length; a++) {
    try {
      if (typeof d[acc[a]] !== "function") continue;
      var c = d[acc[a]]();
      if (c && typeof c.enterCommand === "function" && typeof c.getPrompt === "function") { CL_CACHE[key] = c; return c; }
    } catch (e) {}
  }
  return null;
}
function rawSend(d, cmd) { getCL(d).enterCommand(cmd); }
function prompt(d) { return String(getCL(d).getPrompt()); }
function ensurePriv(d) {
  for (var k = 0; k < 8; k++) {
    var pr = prompt(d);
    if (pr.indexOf("initial configuration dialog") >= 0) { rawSend(d, "no"); rawSend(d, ""); continue; }
    if (pr.indexOf("Username:") >= 0) { rawSend(d, "netadmin"); continue; }
    if (pr.indexOf("Password:") >= 0) { rawSend(d, PASSWORD); continue; }
    if (/>\s*$/.test(pr)) { rawSend(d, "enable"); continue; }
    if (/\(config[^)]*\)#\s*$/.test(pr)) { rawSend(d, "end"); continue; }
    if (/#\s*$/.test(pr)) return true;
    rawSend(d, "");
  }
  return /#\s*$/.test(prompt(d));
}
function pageThrough(cl) {
  // PT switches reject "terminal length 0": answer --More-- with a space until the prompt returns.
  for (var k = 0; k < 60; k++) {
    var o = String(cl.getOutput());
    if (!/(--More--|<--- More --->)\s*$/.test(o)) return;
    var before = o.length;
    try { cl.enterChar(32, 0); } catch (e) { try { cl.enterChar(" "); } catch (e2) {} }
    if (String(cl.getOutput()).length === before) { try { cl.enterCommand(" "); } catch (e3) {} }
  }
}
function run(d, cmd) {
  var cl = getCL(d);
  var before = String(cl.getOutput());
  cl.enterCommand(cmd);
  pageThrough(cl);
  var after = String(cl.getOutput());
  var delta;
  if (after.length >= before.length && after.substring(0, before.length) === before) delta = after.substring(before.length);
  else {
    var tail = before.substring(Math.max(0, before.length - 200));
    var idx = after.lastIndexOf(tail);
    delta = idx >= 0 ? after.substring(idx + tail.length) : after;
  }
  return delta;
}
function snapshot(d) { return String(getCL(d).getOutput()); }
