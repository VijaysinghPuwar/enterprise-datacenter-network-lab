// Presentation layout: tiered top-to-bottom view that fits one screen, with zone captions.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var POS = {
  "INET-SRV": [620, 25], "INET-R": [770, 25],
  "ISP1-R": [670, 110], "ISP2-R": [870, 110],
  "EDGE-R1": [770, 195],
  "FW-1": [770, 285],
  "DMZ-SW": [1010, 270], "DMZ-WEB": [1170, 215], "DMZ-DNS": [1170, 300],
  "CORE-1": [650, 375], "CORE-2": [890, 375],
  "ACC-1": [550, 460], "ACC-2": [1010, 460],
  "WEB-01": [360, 550], "APP-01": [445, 550], "DB-01": [530, 550], "NOC-PC": [615, 550],
  "WEB-02": [870, 550], "APP-02": [960, 550], "DB-02": [1050, 550], "SVC-DNS": [1140, 550], "SVC-MON": [1230, 550]
};
for (var n in POS) { var d = dev(n); if (d) d.moveToLocation(POS[n][0], POS[n][1]); else log("missing " + n); }
// remove previous captions and drawings
var ids = String(LW.getCanvasNoteIds() || "");
if (ids) { var a = ids.split(","); for (var i = 0; i < a.length; i++) { try { LW.removeCanvasItem(a[i]); } catch (e) {} } }
var lids = String(LW.getCanvasLineIds() || "");
if (lids) { var b = lids.split(","); for (var i = 0; i < b.length; i++) { try { LW.removeCanvasItem(b[i]); } catch (e) {} } }
var NOTES = [
  [10, 0,   "ADVANCED ENTERPRISE DATA CENTER  |  Cisco Packet Tracer 9.0  |  dc1.lab  |  22 nodes / 26 links"],
  [10, 40,  "INTERNET (simulated)  AS 64500  |  203.0.113.0/24"],
  [10, 125, "ISP TRANSIT  eBGP  |  ISP1 AS 64501  |  ISP2 AS 64502"],
  [10, 210, "EDGE  EDGE-R1 AS 65010  |  dual-homed eBGP  |  owns 198.51.100.0/24"],
  [10, 280, "SECURITY  FW-1 ASA 5506-X  |  4 zones: outside 0, dmz 50, db 90, inside 100"],
  [10, 298, "inside + db links on dual-homed ToRs (survive either core)  |  NAT, ACLs, inspection, OSPF"],
  [1000, 385, "DMZ 172.16.50.0/24 (VLAN 150 on DMZ-SW)"],
  [1000, 401, "WEB .10 = 198.51.100.10  |  DNS .11 = 198.51.100.11"],
  [10, 380, "CORE  CORE-1 / CORE-2 L3 3560  |  HSRPv2 1s/3s VLAN 10,20,30,50,900  |  OSPF area 0"],
  [10, 398, "LACP Po1 (2x Gi)  |  Rapid-PVST root split  |  transit OSPF 1s/3s  |  DHCP relay  |  SSHv2"],
  [10, 452, "ACCESS  ACC-1 Rack A  |  ACC-2 Rack B  |  802.1Q trunks native 99"],
  [10, 468, "port-security  |  BPDU guard  |  DHCP snooping  |  unused ports VLAN 999 shut"],
  [10, 500, "VLAN 10 MGMT, 20 WEB, 30 APP, 50 SERVICES: 10.10.<vlan>.0/24, HSRP VIP .1"],
  [10, 516, "VLAN 40 DB 10.10.40.0/24: FW-1 db zone, gateway .1 on ASA, no HSRP"],
  [10, 532, "VLAN 900 FW-TRANSIT 10.255.0.0/29: VIP .1, CORE-1 .2, CORE-2 .3, FW-1 .4"],
  [262, 578, "RACK A"], [795, 578, "RACK B"]
];
for (var i = 0; i < NOTES.length; i++) { try { LW.addNote(NOTES[i][0], NOTES[i][1], 0, NOTES[i][2]); } catch (e) { log("note fail " + e); } }
// PT 9 LogicalWorkspace.drawLine(x1, y1, x2, y2, p5, p6, red, green, blue) - colour is args 7..9 (verified)
function box(x1, y1, x2, y2, r, g, b) {
  try { LW.drawLine(x1, y1, x2, y1, 2, 2, r, g, b); LW.drawLine(x2, y1, x2, y2, 2, 2, r, g, b); LW.drawLine(x2, y2, x1, y2, 2, 2, r, g, b); LW.drawLine(x1, y2, x1, y1, 2, 2, r, g, b); return 1; } catch (e) { log("box fail " + e); return 0; }
}
if (typeof DRAW_BOXES !== "undefined" && DRAW_BOXES) {
  box(595, 15, 936, 159, 120, 120, 120);     // INTERNET + ISP (grey)
  box(705, 168, 870, 356, 200, 30, 30);      // EDGE + FIREWALL (red)
  box(991, 198, 1335, 429, 230, 120, 0);     // DMZ (orange)
  box(617, 362, 980, 433, 20, 90, 200);      // CORE (blue)
  box(253, 438, 1338, 625, 20, 150, 60);     // ACCESS + RACKS (green)
}
log("layout applied; notes " + NOTES.length);
flushLog("automation/logs/layout.log");
