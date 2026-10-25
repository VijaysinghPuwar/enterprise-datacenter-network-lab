# Server and workstation setup

These are construction instructions, not a record of completed service tests.
Set each Server-PT's Desktop → IP Configuration from the host table in
`../topology-handoff.md` or `lab-manifest.json`. All server masks are
255.255.255.0. Keep server addresses static.

## SVC-DNS — 10.10.50.10

Services → DNS: turn DNS on and add these A records:

| Name | Address |
| --- | --- |
| web.dc1.lab | 10.10.20.11 |
| web01.dc1.lab | 10.10.20.11 |
| web02.dc1.lab | 10.10.20.12 |
| app.dc1.lab | 10.10.30.11 |
| app02.dc1.lab | 10.10.30.12 |
| db.dc1.lab | 10.10.40.11 |
| db02.dc1.lab | 10.10.40.12 |
| dns.dc1.lab | 10.10.50.10 |
| monitor.dc1.lab | 10.10.50.20 |
| www.internet.example | 203.0.113.10 |
| www.dc1-corp.com | 172.16.50.10 |

The last record is split DNS: internal clients use the DMZ's private address,
avoiding any assumption that ASA hairpin NAT is implemented. Public DNS uses
198.51.100.10 for the same name. All names exist only in this simulator.

Services → DHCP: turn DHCP on and add the pool:

| Setting | Value |
| --- | --- |
| Pool name | MGMT |
| Default gateway | 10.10.10.1 |
| DNS server | 10.10.50.10 |
| Starting IP address | 10.10.10.100 |
| Subnet mask | 255.255.255.0 |
| Maximum users | 50 |

Save/add the pool. Remove or disable unintended default pools. Both cores
relay VLAN 10 broadcasts to this server. On NOC-PC select DHCP, verify a lease
in .100–.149, then verify the gateway and DNS fields. Duplicate relay messages
can occur because both cores relay; verify that the resulting client lease is
valid and unique.

## SVC-MON — 10.10.50.20

Services → SYSLOG: enable collection. Generate an interface event on an
internal switch, restore the interface, and verify that a message appears.

Services → NTP: enable NTP. Set a known lab time if the interface offers it.
Verify device NTP status with the command supported by that model; do not claim
time synchronization solely because `ntp server` exists in the config.

Services → AAA is optional. Follow the staged instructions in
`CONFIGURATION-NOTES.md`. Baseline device access is local SSH. Enable TFTP only
if carrying out the optional configuration-backup exercise below.

## Internal WEB-01 / WEB-02

Services → HTTP: enable HTTP. Replace `index.html` with the corresponding page
in `server-pages/`. Keep its identity visible so a browser test proves which
server answered. Enable HTTPS only if the chosen Server-PT supports it and the
browser test passes. A permitted firewall port does not prove HTTPS exists.

## APP-01 / APP-02 and DB-01 / DB-02

Set their static IP configuration. HTTP identity pages may be used as explicit
network test services. These devices represent segmented application and
database network tiers; no application runtime, SQL engine, data replication,
storage fabric, or application load balancer is implemented.

Use APP-01 → DB-01 ping as an allowed segmentation test and WEB-01 → DB-01
ping as a denied test. Check INSIDE_IN counters on FW-1. The database hosts use
FW-1's database interface at 10.10.40.1 as gateway; cores bridge VLAN 40 without
an SVI or HSRP group. New DB-initiated sessions to APP are denied by DB_IN;
UDP DNS, NTP and syslog have specific service exceptions. Tests between two
database hosts in VLAN 40 remain within that VLAN and do not cross the firewall.

## DMZ-WEB — 172.16.50.10

Enable HTTP and use the DMZ page from `server-pages/`. The public static NAT
address is 198.51.100.10. From INET-SRV use Desktop → Web Browser to open
`http://198.51.100.10`, then `http://www.dc1-corp.com`. Outside ICMP is denied
by design and should not be the public-service acceptance test.

## DMZ-DNS — 172.16.50.11

Enable DNS and add A record `www.dc1-corp.com` → `198.51.100.10`. Its public
static NAT address is 198.51.100.11. Permit both TCP and UDP DNS at the ASA.
Do not configure this server to resolve arbitrary Internet names unless
additional records and a verified resolution path are actually provided.

## INET-SRV — 203.0.113.10

Enable HTTP and use its Internet test page. Enable DNS and add:

| Name | Address |
| --- | --- |
| www.internet.example | 203.0.113.10 |
| www.dc1-corp.com | 198.51.100.10 |

Its normal DNS setting is itself. For the dedicated public DNS test, temporarily
set its DNS client to 198.51.100.11, resolve `www.dc1-corp.com`, then restore the
normal setting. This proves traversal to DMZ-DNS instead of only testing the
INET-SRV's local DNS record.

## Optional configuration backup

Enable TFTP on SVC-MON. From each internal IOS switch execute
`copy running-config tftp:` and answer the prompts with 10.10.50.20 and a unique
filename such as `CORE-1-running.cfg`. Confirm the file appears on the server.
The presence of the separate source config files is not a successful TFTP test.

After all service tests, save each IOS device with `write memory` and save the
healthy Packet Tracer file. Record actual outcomes in `evidence/RESULTS.md`.
