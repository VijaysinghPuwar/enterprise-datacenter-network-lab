// ============================================================================
//  Advanced Data Center - server services (DNS, DHCP, Syslog, NTP, HTTP pages)
//  Source: lab-support/SERVER-SERVICES.md and lab-support/server-pages/
// ============================================================================
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
function keys(o) { var a = []; try { for (var k in o) a.push(k); } catch (e) {} return a.join(","); }
function tryCall(label, fn) { try { var r = fn(); log("  ok " + label + " => " + r); return r; } catch (e) { log("  FAIL " + label + " => " + e); return null; } }

function dnsRecords(server, records) {
  var dns = dev(server).getProcess("DnsServer");
  tryCall(server + " dns enable", function () { return dns.setEnable(true); });
  var existing = 0; try { existing = dns.getSizeOfNameServerDb(); } catch (e) {}
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var have = false; try { have = dns.isDomainNameExisted(r[0]); } catch (e) {}
    if (have) { log("  exists " + r[0]); continue; }
    tryCall(server + " A " + r[0] + " " + r[1], function () { return dns.addARecordToNameServerDb(r[0], r[1]); });
  }
  log("  " + server + " dns db size " + existing + " -> " + dns.getSizeOfNameServerDb() + " enabled " + dns.isEnabled());
}
function httpPage(server, file) {
  var http = dev(server).getProcess("HttpServer");
  var html = String(readFile("lab-support/server-pages/" + file));
  tryCall(server + " http enable", function () { return http.setEnable(true); });
  tryCall(server + " set index.html", function () { return http.setPageContents("index.html", html); });
  var got = ""; try { got = String(http.getPage("index.html")); } catch (e) { got = "ERR " + e; }
  log("  " + server + " index.html length now " + got.length + " (source " + html.length + ")");
}

log("== DNS");
dnsRecords("SVC-DNS", [
  ["web.dc1.lab", "10.10.20.11"], ["web01.dc1.lab", "10.10.20.11"], ["web02.dc1.lab", "10.10.20.12"],
  ["app.dc1.lab", "10.10.30.11"], ["app02.dc1.lab", "10.10.30.12"],
  ["db.dc1.lab", "10.10.40.11"], ["db02.dc1.lab", "10.10.40.12"],
  ["dns.dc1.lab", "10.10.50.10"], ["monitor.dc1.lab", "10.10.50.20"],
  ["www.internet.example", "203.0.113.10"], ["www.dc1-corp.com", "172.16.50.10"]
]);
dnsRecords("DMZ-DNS", [["www.dc1-corp.com", "198.51.100.10"]]);
dnsRecords("INET-SRV", [["www.internet.example", "203.0.113.10"], ["www.dc1-corp.com", "198.51.100.10"]]);

log("== DHCP probe");
var mainP = dev("SVC-DNS").getProcess("DhcpServerMainProcess");
var dh = mainP.getDhcpServerProcessByPortName("FastEthernet0");
log("  DHCP proc keys: " + keys(dh));

log("== Syslog / NTP");
var sl = dev("SVC-MON").getProcess("SyslogServer");
tryCall("SVC-MON syslog enable", function () { return sl.setEnable(true); });
var ntp = dev("SVC-MON").getProcess("NtpServer");
tryCall("SVC-MON ntp enable", function () { return ntp.setEnabled(true); });
log("  syslog enabled " + sl.isEnabled() + " ntp enabled " + ntp.isEnabled());
log("  AAA proc probe: " + keys(dev("SVC-MON").getProcess("AaaServer")) + " | " + keys(dev("SVC-MON").getProcess("AAAServerProcess")));

log("== HTTP pages");
var pages = ["WEB-01", "WEB-02", "APP-01", "APP-02", "DB-01", "DB-02", "DMZ-WEB", "INET-SRV"];
for (var i = 0; i < pages.length; i++) httpPage(pages[i], pages[i] + "-index.html");

flushLog("automation/logs/services.log");
