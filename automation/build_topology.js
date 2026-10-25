// ============================================================================
//  Advanced Data Center - topology builder (Packet Tracer 9.0 Script Engine)
//  Source of truth: ../topology-handoff.md
//  Places 22 devices, cables 25 links with exact interfaces, sets host IPs,
//  and draws zone labels. Re-runnable: removes previously built devices first.
// ============================================================================
eval(readFileRaw("automation/lib.js"));
function readFileRaw(rel) { return ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/" + rel); }

var T = { router: 0, sw: 1, pc: 8, server: 9, mls: 16, asa: 27 };
var STRAIGHT = 8100, CROSS = 8101;

// name, type, model, x, y
var DEVICES = [
  ["INET-SRV", T.server, "Server-PT", 230, 70],
  ["INET-R",   T.router, "2911",      470, 70],
  ["ISP1-R",   T.router, "2911",      360, 175],
  ["ISP2-R",   T.router, "2911",      580, 175],
  ["EDGE-R1",  T.router, "ISR4331",   470, 280],
  ["FW-1",     T.asa,    "5506-X",    470, 385],
  ["DMZ-SW",   T.sw,     "2960-24TT", 760, 385],
  ["DMZ-WEB",  T.server, "Server-PT", 930, 335],
  ["DMZ-DNS",  T.server, "Server-PT", 930, 440],
  ["CORE-1",   T.mls,    "3560-24PS", 360, 495],
  ["CORE-2",   T.mls,    "3560-24PS", 580, 495],
  ["ACC-1",    T.sw,     "2960-24TT", 250, 605],
  ["ACC-2",    T.sw,     "2960-24TT", 690, 605],
  ["WEB-01",   T.server, "Server-PT",  90, 720],
  ["APP-01",   T.server, "Server-PT", 190, 720],
  ["DB-01",    T.server, "Server-PT", 290, 720],
  ["WEB-02",   T.server, "Server-PT", 530, 720],
  ["APP-02",   T.server, "Server-PT", 630, 720],
  ["DB-02",    T.server, "Server-PT", 730, 720],
  ["SVC-DNS",  T.server, "Server-PT", 830, 720],
  ["SVC-MON",  T.server, "Server-PT", 930, 720]
];
var NOC_PC = ["NOC-PC", 390, 720];   // existing PC0 is reused and renamed

// id, devA, portA, devB, portB, cable
var LINKS = [
  ["L1",  "INET-R",  "GigabitEthernet0/0",   "ISP1-R",  "GigabitEthernet0/0",   CROSS],
  ["L2",  "INET-R",  "GigabitEthernet0/1",   "ISP2-R",  "GigabitEthernet0/0",   CROSS],
  ["L3",  "INET-R",  "GigabitEthernet0/2",   "INET-SRV","FastEthernet0",        CROSS],
  ["L4",  "ISP1-R",  "GigabitEthernet0/1",   "EDGE-R1", "GigabitEthernet0/0/0", CROSS],
  ["L5",  "ISP2-R",  "GigabitEthernet0/1",   "EDGE-R1", "GigabitEthernet0/0/1", CROSS],
  ["L6",  "EDGE-R1", "GigabitEthernet0/0/2", "FW-1",    "GigabitEthernet1/1",   CROSS],
  ["L7",  "FW-1",    "GigabitEthernet1/2",   "CORE-1",  "FastEthernet0/24",     STRAIGHT],
  ["L8",  "FW-1",    "GigabitEthernet1/3",   "DMZ-SW",  "GigabitEthernet0/1",   STRAIGHT],
  ["L9",  "CORE-1",  "GigabitEthernet0/1",   "CORE-2",  "GigabitEthernet0/1",   CROSS],
  ["L10", "CORE-1",  "GigabitEthernet0/2",   "CORE-2",  "GigabitEthernet0/2",   CROSS],
  ["L11", "CORE-1",  "FastEthernet0/1",      "ACC-1",   "GigabitEthernet0/1",   CROSS],
  ["L12", "CORE-2",  "FastEthernet0/1",      "ACC-1",   "GigabitEthernet0/2",   CROSS],
  ["L13", "CORE-1",  "FastEthernet0/2",      "ACC-2",   "GigabitEthernet0/1",   CROSS],
  ["L14", "CORE-2",  "FastEthernet0/2",      "ACC-2",   "GigabitEthernet0/2",   CROSS],
  ["L15", "ACC-1",   "FastEthernet0/1",      "WEB-01",  "FastEthernet0",        STRAIGHT],
  ["L16", "ACC-1",   "FastEthernet0/2",      "APP-01",  "FastEthernet0",        STRAIGHT],
  ["L17", "ACC-1",   "FastEthernet0/3",      "DB-01",   "FastEthernet0",        STRAIGHT],
  ["L18", "ACC-1",   "FastEthernet0/10",     "NOC-PC",  "FastEthernet0",        STRAIGHT],
  ["L19", "ACC-2",   "FastEthernet0/1",      "WEB-02",  "FastEthernet0",        STRAIGHT],
  ["L20", "ACC-2",   "FastEthernet0/2",      "APP-02",  "FastEthernet0",        STRAIGHT],
  ["L21", "ACC-2",   "FastEthernet0/3",      "DB-02",   "FastEthernet0",        STRAIGHT],
  ["L22", "ACC-2",   "FastEthernet0/5",      "SVC-DNS", "FastEthernet0",        STRAIGHT],
  ["L23", "ACC-2",   "FastEthernet0/6",      "SVC-MON", "FastEthernet0",        STRAIGHT],
  ["L24", "DMZ-SW",  "FastEthernet0/1",      "DMZ-WEB", "FastEthernet0",        STRAIGHT],
  ["L25", "DMZ-SW",  "FastEthernet0/2",      "DMZ-DNS", "FastEthernet0",        STRAIGHT]
];

// name, ip, mask, gateway, dns  (NOC-PC uses DHCP)
var HOSTS = [
  ["WEB-01",  "10.10.20.11", "255.255.255.0", "10.10.20.1",  "10.10.50.10"],
  ["WEB-02",  "10.10.20.12", "255.255.255.0", "10.10.20.1",  "10.10.50.10"],
  ["APP-01",  "10.10.30.11", "255.255.255.0", "10.10.30.1",  "10.10.50.10"],
  ["APP-02",  "10.10.30.12", "255.255.255.0", "10.10.30.1",  "10.10.50.10"],
  ["DB-01",   "10.10.40.11", "255.255.255.0", "10.10.40.1",  "10.10.50.10"],
  ["DB-02",   "10.10.40.12", "255.255.255.0", "10.10.40.1",  "10.10.50.10"],
  ["SVC-DNS", "10.10.50.10", "255.255.255.0", "10.10.50.1",  "10.10.50.10"],
  ["SVC-MON", "10.10.50.20", "255.255.255.0", "10.10.50.1",  "10.10.50.10"],
  ["DMZ-WEB", "172.16.50.10","255.255.255.0", "172.16.50.1", "172.16.50.11"],
  ["DMZ-DNS", "172.16.50.11","255.255.255.0", "172.16.50.1", "172.16.50.11"],
  ["INET-SRV","203.0.113.10","255.255.255.0", "203.0.113.1", "203.0.113.10"]
];

var NOTES = [
  [20, 20,  "ADVANCED ENTERPRISE DATA CENTER  |  Packet Tracer 9.0  |  dc1.lab"],
  [610, 55, "INTERNET (simulated)  AS 64500  203.0.113.0/24"],
  [700, 165, "ISP TRANSIT  eBGP  ISP1 AS 64501 / ISP2 AS 64502"],
  [590, 275, "EDGE  EDGE-R1 AS 65010  owns 198.51.100.0/24"],
  [60, 380, "PERIMETER  FW-1 ASA 5506-X  outside(0) / inside(100) / dmz(50)  NAT + ACL + inspection"],
  [740, 470, "DMZ  172.16.50.0/24  static NAT .10 web / .11 dns"],
  [60, 480, "CORE  CORE-1/2 L3  HSRPv2  OSPF area 0  LACP Po1  Rapid-PVST"],
  [60, 800, "RACK A  ACC-1 ToR"],
  [520, 800, "RACK B  ACC-2 ToR"],
  [60, 830, "VLAN 10 MGMT  20 WEB  30 APP  40 DB (ACL DB-PROTECT)  50 SERVICES  900 FW-TRANSIT  |  10.10.<vlan>.0/24  VIP .1"]
];
var NOTE_TEXT = {};
for (var i = 0; i < NOTES.length; i++) NOTE_TEXT[NOTES[i][2]] = 1;

// ---- 1. clean previous build (keep the original PC0 / NOC-PC) --------------
var existing = [];
for (var i = 0; i < NET.getDeviceCount(); i++) existing.push(NET.getDeviceAt(i).getName());
for (var i = 0; i < existing.length; i++) {
  if (existing[i] !== "PC0" && existing[i] !== "NOC-PC") { LW.removeDevice(existing[i]); log("removed " + existing[i]); }
}
var lineIds = String(LW.getCanvasLineIds() || "");
if (lineIds) { var ids = lineIds.split(","); for (var i = 0; i < ids.length; i++) { try { LW.removeCanvasItem(ids[i]); } catch (e) {} } }
var noteIds = String(LW.getCanvasNoteIds() || "");
if (noteIds) {
  var nids = noteIds.split(",");
  for (var i = 0; i < nids.length; i++) {
    var txt = "";
    try { txt = String(LW.getCanvasNoteText(nids[i])); } catch (e) {}
    log("existing note " + nids[i] + " text='" + txt + "'");
    if (txt === "NOTE-TEST-A" || NOTE_TEXT[txt]) { try { LW.removeCanvasItem(nids[i]); log("  removed note"); } catch (e) {} }
  }
}

// ---- 2. devices -------------------------------------------------------------
for (var i = 0; i < DEVICES.length; i++) {
  var d = DEVICES[i];
  var auto = LW.addDevice(d[1], d[2], d[3], d[4]);
  var obj = dev(auto);
  obj.setName(d[0]);
  try { if (typeof obj.skipBoot === "function") obj.skipBoot(); } catch (e) {}
  log("device " + d[0] + " (" + d[2] + ") <- " + auto);
}
var pc = dev("PC0") || dev("NOC-PC");
pc.setName(NOC_PC[0]);
pc.moveToLocation(NOC_PC[1], NOC_PC[2]);
log("device NOC-PC (PC-PT) reused from PC0");

// ---- 3. cabling -------------------------------------------------------------
var ok = 0;
for (var i = 0; i < LINKS.length; i++) {
  var L = LINKS[i];
  var r = LW.createLink(L[1], L[2], L[3], L[4], L[5]);
  if (r) ok++;
  log("link " + L[0] + " " + L[1] + " " + L[2] + " <-> " + L[3] + " " + L[4] + " cable " + (L[5] === CROSS ? "cross" : "straight") + " => " + r);
}
log("links created " + ok + "/" + LINKS.length);

// ---- 4. host addressing -----------------------------------------------------
for (var i = 0; i < HOSTS.length; i++) {
  var h = HOSTS[i], o = dev(h[0]), p = o.getPort("FastEthernet0");
  try { if (typeof o.setDhcpFlag === "function") o.setDhcpFlag(false); } catch (e) {}
  p.setIpSubnetMask(h[1], h[2]);
  try { o.setDefaultGateway(h[3]); } catch (e) { p.setDefaultGateway(h[3]); }
  try { p.setDnsServerIp(h[4]); } catch (e) { log("dns set failed " + h[0] + " " + e); }
  log("host " + h[0] + " " + h[1] + "/" + h[2] + " gw " + h[3] + " dns " + h[4]);
}
var noc = dev("NOC-PC");
noc.setDhcpFlag(true);
log("host NOC-PC DHCP client");

// ---- 5. zone labels ---------------------------------------------------------

for (var i = 0; i < NOTES.length; i++) {
  try { LW.addNote(NOTES[i][0], NOTES[i][1], 0, NOTES[i][2]); } catch (e) { log("note failed " + e); }
}
log("BUILD COMPLETE devices=" + NET.getDeviceCount() + " links=" + NET.getLinkCount());
flushLog("automation/logs/build_topology.log");
