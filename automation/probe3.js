function plog(s) { try { dprint(String(s)); } catch (e) {} }
function keys(o) { var a = []; try { for (var k in o) a.push(k); } catch (e) { a.push("ERR " + e); } return a.join(","); }
try {
  var lw = ipc.appWindow().getActiveWorkspace().getLogicalWorkspace();
  var net = ipc.network();
  var tests = [
    ["Router0", "GigabitEthernet0/0", "Router1", "GigabitEthernet0/0/0", 8101],
    ["Switch0", "FastEthernet0/1", "Server0", "FastEthernet0", 8100],
    ["Multilayer Switch0", "GigabitEthernet0/1", "Switch0", "GigabitEthernet0/1", 8101],
    ["ASA0", "GigabitEthernet1/1", "Router0", "GigabitEthernet0/1", 8101]
  ];
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i], r;
    try { r = lw.createLink(t[0], t[1], t[2], t[3], t[4]); } catch (e) { r = "EXC " + e; }
    plog("link " + t[0] + " " + t[1] + " <-> " + t[2] + " " + t[3] + " type " + t[4] + " => " + r);
  }
  plog("linkCount=" + net.getLinkCount());
  if (net.getLinkCount() > 0) {
    var L = net.getLinkAt(0);
    plog("LINK: " + keys(L));
    try { plog("link0 type " + L.getConnectionType()); } catch (e) {}
  }
  plog("SFM: " + keys(ipc.systemFileManager()));
  var s = net.getDevice("Server0");
  var names = ["DnsServer", "DNS Server", "DnsServerProcess", "DhcpServer", "DhcpServerMainProcess", "DHCPServerMainProcess", "HttpServer", "SyslogServer", "NtpServer", "AAAServer", "AaaServer", "TacacsServer"];
  for (var j = 0; j < names.length; j++) {
    try { var p = s.getProcess(names[j]); plog("proc " + names[j] + " => " + (p ? ("OBJ " + keys(p)) : "null")); } catch (e) { plog("proc " + names[j] + " EXC " + e); }
  }
  try { plog("note1 => " + lw.addNote(300, 650, 0, "NOTE-TEST-A")); } catch (e) { plog("note1 EXC " + e); }
  try { plog("line => " + lw.drawLine(100, 700, 400, 700, 3, 255, 0, 0, 255)); } catch (e) { plog("line EXC " + e); }
  try { plog("circle => " + lw.drawCircle(500, 700, 40, 3, 0, 0, 255, 255)); } catch (e) { plog("circle EXC " + e); }
  plog("notes " + lw.getCanvasNoteIds() + " lines " + lw.getCanvasLineIds() + " rects " + lw.getCanvasRectIds());
  var r0 = net.getDevice("Router0");
  plog("Router0 cl prompt '" + r0.getCommandLine().getPrompt() + "' booting " + r0.isBooting());
} catch (e) { plog("ERR3 " + e); }
