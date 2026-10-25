function plog(s) { try { dprint(String(s)); } catch (e) {} }
function keys(o) { var a = []; try { for (var k in o) a.push(k); } catch (e) { a.push("ERR " + e); } return a.join(","); }
try {
  var lw = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
  plog("LW: " + keys(lw));
  var net = ipc.network();
  plog("NET: " + keys(net));
  var r = net.getDevice("Router0");
  plog("DEV: " + keys(r));
  var cl = r.getCommandLine();
  plog("CL: " + keys(cl));
  var p = r.getPortAt(0);
  plog("PORT: " + keys(p));
  plog("port0 name " + p.getName() + " count " + r.getPortCount());
  plog("IPC: " + keys(ipc));
  plog("AW: " + keys(ipc.appWindow()));
  var s = net.getDevice("Server0");
  plog("SRV: " + keys(s));
} catch (e) { plog("ERR2 " + e); }
