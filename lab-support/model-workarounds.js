// DC1 File Script Module: Packet Tracer 9 ASA model workaround.
// Runs automatically when Advanced-DataCenter.pkt is opened (File Script Module, On Startup).
//
// Why: the PT 9 ASA answers ARP for hosts on its own db/inside segments (proxy ARP) and the
// PT ASA CLI does not implement "sysopt noproxyarp <if>". Left on, DB-01 resolves DB-02's IP to
// the firewall MAC and same-VLAN DB traffic is black-holed. The port flag does not survive a
// file save/reopen, so this module re-applies it on every open.
//
// What it does (and nothing else): no external files, no network requests, no topology changes.
//   1. Disable proxy ARP on FW-1 inside (Gi1/2) and db (Gi1/4).
//   2. Flush the ARP cache on DB-01 and DB-02 ("arp -d") so no entry learned before step 1
//      survives. Real-world equivalent: "clear arp" on hosts after a proxy-ARP change.
function applyDc1ProxyArpWorkaround() {
    var fw = ipc.network().getDevice("FW-1");
    var ports = ["GigabitEthernet1/2", "GigabitEthernet1/4"];
    for (var i = 0; i < ports.length; i++) {
        var p = fw.getPort(ports[i]);
        var before = p.isProxyArpEnabled();
        p.setProxyArpEnabled(false);
        dprint("FW-1 " + ports[i] + " proxy ARP: " + before + " -> " + p.isProxyArpEnabled());
    }
}

function flushDbArpCaches() {
    var hosts = ["DB-01", "DB-02"];
    for (var i = 0; i < hosts.length; i++) {
        try {
            ipc.network().getDevice(hosts[i]).getCommandLine().enterCommand("arp -d");
            dprint(hosts[i] + " ARP cache flushed");
        } catch (e) {
            dprint(hosts[i] + " ARP flush failed: " + e);
        }
    }
}

function main() {
    applyDc1ProxyArpWorkaround();
    flushDbArpCaches();
}

function cleanUp() {}
