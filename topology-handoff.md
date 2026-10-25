# Advanced Data Center — Topology Handoff (source of truth)

Single source of truth for devices, cabling, addressing, routing and firewall policy. Device configs and validation live in `lab-support/`.
Revised during runtime validation: **22 logical network nodes, 26 physical links**.
Packet Tracer: **9.0** (macOS). Working file: **Advanced-DataCenter.pkt** (original `DataCenter.pkt` left untouched).
Domain: `dc1.lab`. All passwords/keys below are lab placeholders.

Design summary: single-site enterprise data center. Collapsed core/distribution pair (L3, HSRPv2, Rapid-PVST, LACP between the pair only),
two rack ToR access switches with independent uplinks to both cores (no cross-chassis EtherChannel / no vPC / no VXLAN-EVPN),
ASA firewall with inside / DMZ / database / outside zones, multihomed edge router running eBGP to two ISPs, simulated Internet.
The database zone replaces the original SVI ACL plan because the selected PT 3560 model accepted ACL commands without installing an effective SVI binding during tests.

## 1. Devices (exact Packet Tracer models)

| Name | PT model | Role |
|---|---|---|
| INET-R | 2911 | Simulated Internet core, AS 64500 |
| INET-SRV | Server-PT | Internet host (web + DNS) 203.0.113.10 |
| ISP1-R | 2911 | ISP A, AS 64501 |
| ISP2-R | 2911 | ISP B, AS 64502 |
| EDGE-R1 | ISR4331 | DC edge router, eBGP multihomed, AS 65010, owns 198.51.100.0/24 |
| FW-1 | 5506-X (ASA) | Stateful firewall: outside / inside / dmz / db, NAT, ACLs, inspection |
| DMZ-SW | 2960-24TT | DMZ access switch |
| DMZ-WEB | Server-PT | Public web server (static NAT 198.51.100.10) |
| DMZ-DNS | Server-PT | Public authoritative DNS (static NAT 198.51.100.11) |
| CORE-1 | 3560-24PS | Core/distribution A — HSRP active + STP root for VLAN 10, 30, 50, 900 |
| CORE-2 | 3560-24PS | Core/distribution B — HSRP active for VLAN 20; STP root for VLAN 20, 40 |
| ACC-1 | 2960-24TT | Dual-homed Rack A ToR; firewall inside attachment on Fa0/24 |
| ACC-2 | 2960-24TT | Dual-homed Rack B ToR; firewall database attachment on Fa0/24 |
| WEB-01 | Server-PT | Web tier, rack A |
| APP-01 | Server-PT | App tier, rack A |
| DB-01 | Server-PT | DB tier, rack A |
| NOC-PC | PC-PT (existing PC0, renamed) | Management workstation (DHCP) |
| WEB-02 | Server-PT | Web tier, rack B |
| APP-02 | Server-PT | App tier, rack B |
| DB-02 | Server-PT | DB tier, rack B |
| SVC-DNS | Server-PT | Internal DNS + DHCP |
| SVC-MON | Server-PT | Syslog + NTP (TACACS+ is an optional exercise, not in the verified baseline) |

## 2. Cable map (exact interfaces)

| # | Side A | Side B | Cable | Purpose |
|---|---|---|---|---|
| L1 | INET-R Gi0/0 | ISP1-R Gi0/0 | Copper cross-over | 100.64.0.0/30 |
| L2 | INET-R Gi0/1 | ISP2-R Gi0/0 | Copper cross-over | 100.64.0.4/30 |
| L3 | INET-R Gi0/2 | INET-SRV Fa0 | Copper cross-over | 203.0.113.0/24 |
| L4 | ISP1-R Gi0/1 | EDGE-R1 Gi0/0/0 | Copper cross-over | 100.64.1.0/30 |
| L5 | ISP2-R Gi0/1 | EDGE-R1 Gi0/0/1 | Copper cross-over | 100.64.2.0/30 |
| L6 | EDGE-R1 Gi0/0/2 | FW-1 Gi1/1 | Copper cross-over | outside 198.51.100.0/29 |
| L7 | FW-1 Gi1/2 | ACC-1 Fa0/24 | Copper straight | inside, ACC-1 Fa0/24 = access VLAN 900 |
| L8 | FW-1 Gi1/3 | DMZ-SW Gi0/1 | Copper straight | dmz 172.16.50.0/24 |
| L9 | CORE-1 Gi0/1 | CORE-2 Gi0/1 | Copper cross-over | Po1 member (LACP) |
| L10 | CORE-1 Gi0/2 | CORE-2 Gi0/2 | Copper cross-over | Po1 member (LACP) |
| L11 | CORE-1 Fa0/1 | ACC-1 Gi0/1 | Copper cross-over | 802.1Q trunk |
| L12 | CORE-2 Fa0/1 | ACC-1 Gi0/2 | Copper cross-over | 802.1Q trunk |
| L13 | CORE-1 Fa0/2 | ACC-2 Gi0/1 | Copper cross-over | 802.1Q trunk |
| L14 | CORE-2 Fa0/2 | ACC-2 Gi0/2 | Copper cross-over | 802.1Q trunk |
| L15 | ACC-1 Fa0/1 | WEB-01 Fa0 | Copper straight | VLAN 20 |
| L16 | ACC-1 Fa0/2 | APP-01 Fa0 | Copper straight | VLAN 30 |
| L17 | ACC-1 Fa0/3 | DB-01 Fa0 | Copper straight | VLAN 40 |
| L18 | ACC-1 Fa0/10 | NOC-PC Fa0 | Copper straight | VLAN 10 |
| L19 | ACC-2 Fa0/1 | WEB-02 Fa0 | Copper straight | VLAN 20 |
| L20 | ACC-2 Fa0/2 | APP-02 Fa0 | Copper straight | VLAN 30 |
| L21 | ACC-2 Fa0/3 | DB-02 Fa0 | Copper straight | VLAN 40 |
| L22 | ACC-2 Fa0/5 | SVC-DNS Fa0 | Copper straight | VLAN 50 |
| L23 | ACC-2 Fa0/6 | SVC-MON Fa0 | Copper straight | VLAN 50 |
| L24 | DMZ-SW Fa0/1 | DMZ-WEB Fa0 | Copper straight | DMZ |
| L25 | DMZ-SW Fa0/2 | DMZ-DNS Fa0 | Copper straight | DMZ |
| L26 | FW-1 Gi1/4 | ACC-2 Fa0/24 | Copper straight | DB zone; ACC-2 Fa0/24 = access VLAN 40 |

All other switch ports: access VLAN 999 (BLACKHOLE), shutdown.

## 3. VLANs and gateways (internal fabric)

| VLAN | Name | Subnet | Gateway | CORE-1 | CORE-2 | Gateway / STP root |
|---|---|---|---|---|---|---|
| 10 | MGMT | 10.10.10.0/24 | .1 | .2 | .3 | CORE-1 |
| 20 | WEB | 10.10.20.0/24 | .1 | .2 | .3 | CORE-2 |
| 30 | APP | 10.10.30.0/24 | .1 | .2 | .3 | CORE-1 |
| 40 | DB | 10.10.40.0/24 | .1 on FW-1 db | L2 only, no SVI | L2 only, no SVI | ASA gateway / CORE-2 STP root |
| 50 | SERVICES | 10.10.50.0/24 | .1 | .2 | .3 | CORE-1 |
| 900 | FW-TRANSIT | 10.255.0.0/29 | .1 | .2 | .3 | CORE-1 (FW-1 inside = .4) |
| 99 | NATIVE-UNUSED | — | — | — | — | native VLAN on all trunks |
| 999 | BLACKHOLE | — | — | — | — | unused ports |

HSRP: version 2, group number = VLAN ID for 10,20,30,50,900 only; active priority 110 + preempt, standby priority 100. Configured intent was hello/hold 1/3 s, but the PT 9 3560 saves `standby <g> timers 1 3` as `standby 0 timers 1 3`, so the saved lab runs the default **3/10 s** (see Change 4).
VLAN 40 is bridged from both racks to FW-1's database interface. It has no core SVI and no HSRP.
Trunks: dot1q, native 99, nonegotiate. All core/ToR trunks and Po1 allow 10,20,30,40,50,99,900.
VLAN 900 reaches both cores through both dual-homed ToRs. Former core firewall ports Fa0/24 are parked/shut in VLAN 999.
Loopbacks (OSPF RID): CORE-1 Lo0 10.255.255.1/32, CORE-2 Lo0 10.255.255.2/32.

## 4. Host addressing

| Host | IP / mask | Gateway | DNS |
|---|---|---|---|
| WEB-01 | 10.10.20.11/24 | 10.10.20.1 | 10.10.50.10 |
| WEB-02 | 10.10.20.12/24 | 10.10.20.1 | 10.10.50.10 |
| APP-01 | 10.10.30.11/24 | 10.10.30.1 | 10.10.50.10 |
| APP-02 | 10.10.30.12/24 | 10.10.30.1 | 10.10.50.10 |
| DB-01 | 10.10.40.11/24 | 10.10.40.1 | 10.10.50.10 |
| DB-02 | 10.10.40.12/24 | 10.10.40.1 | 10.10.50.10 |
| SVC-DNS | 10.10.50.10/24 | 10.10.50.1 | 10.10.50.10 |
| SVC-MON | 10.10.50.20/24 | 10.10.50.1 | 10.10.50.10 |
| NOC-PC | DHCP (pool 10.10.10.100–149) | 10.10.10.1 | 10.10.50.10 |
| ACC-1 mgmt | Vlan10 10.10.10.11/24 | 10.10.10.1 | — |
| ACC-2 mgmt | Vlan10 10.10.10.12/24 | 10.10.10.1 | — |
| DMZ-SW mgmt | Vlan150 172.16.50.5/24 (DMZ access VLAN 150) | 172.16.50.1 | — |
| DMZ-WEB | 172.16.50.10/24 | 172.16.50.1 | 172.16.50.11 |
| DMZ-DNS | 172.16.50.11/24 | 172.16.50.1 | 172.16.50.11 |
| INET-SRV | 203.0.113.10/24 | 203.0.113.1 | 203.0.113.10 |

DHCP: SVC-DNS serves pool MGMT; CORE-1/CORE-2 Vlan10 `ip helper-address 10.10.50.10`.
DNS: SVC-DNS internal zone `dc1.lab` (web.dc1.lab → 10.10.20.11, app.dc1.lab → 10.10.30.11, db.dc1.lab → 10.10.40.11).
DMZ-DNS public zone: www.dc1-corp.com → 198.51.100.10. INET-SRV: www.internet.example → 203.0.113.10.

## 5. Routing

Edge / Internet (eBGP):
| Router | AS | Neighbors | Advertises |
|---|---|---|---|
| INET-R | 64500 | 100.64.0.2 (64501), 100.64.0.6 (64502) | 203.0.113.0/24 |
| ISP1-R | 64501 | 100.64.0.1 (64500), 100.64.1.2 (65010) | transit |
| ISP2-R | 64502 | 100.64.0.5 (64500), 100.64.2.2 (65010) | transit |
| EDGE-R1 | 65010 | 100.64.1.1 (64501), 100.64.2.1 (64502) | 198.51.100.0/24 |

EDGE-R1 interfaces: Gi0/0/0 100.64.1.2/30, Gi0/0/1 100.64.2.2/30, Gi0/0/2 198.51.100.1/29.
EDGE-R1 statics: `ip route 198.51.100.0 255.255.255.0 198.51.100.2` (public block → FW-1, also BGP origin);
default `0.0.0.0/0 → 100.64.1.1` with floating `0.0.0.0/0 → 100.64.2.1 250`. The static default prefers ISP1.
Advanced BGP weight/prefix-list/route-map policy is not in the verified baseline. The first live BGP best path to 203.0.113.0/24 used ISP2; inspect the current best path before each failure test. Non-transit outbound BGP filtering is not implemented.
ISP1-R: Gi0/0 100.64.0.2/30, Gi0/1 100.64.1.1/30. ISP2-R: Gi0/0 100.64.0.6/30, Gi0/1 100.64.2.1/30.
INET-R: Gi0/0 100.64.0.1/30, Gi0/1 100.64.0.5/30, Gi0/2 203.0.113.1/24.

Inside: OSPF process 10, area 0, on VLAN 900 between CORE-1, CORE-2 and FW-1; internal server SVIs are passive (advertised).
FW-1 originates the default route and advertises its directly connected 10.10.40.0/24 database zone. The simulator rejected `passive-interface db`; baseline source omits that unverified command.
Transit OSPF hello/dead timers are 1/3 seconds on both core Vlan900s and ASA Gi1/2. Core transit SVIs use `no ip proxy-arp`. FW-1 learns the four inside /24 return routes through OSPF; the earlier static returns through the HSRP VIP have been removed after stale ARP behavior during core failure.
CORE-2's passive server SVIs have OSPF cost 100; CORE-1 retains the default cost. FW-1 normally prefers CORE-1's advertised server prefixes and must switch to CORE-2 after a CORE-1 outage. The transit HSRP VIP remains a gateway-redundancy exercise; ASA return forwarding now follows OSPF next hops.

## 6. Firewall (FW-1, ASA 5506-X)

| Interface | nameif | security-level | IP |
|---|---|---|---|
| Gi1/1 | outside | 0 | 198.51.100.2/29 |
| Gi1/2 | inside | 100 | 10.255.0.4/29 |
| Gi1/3 | dmz | 50 | 172.16.50.1/24 |
| Gi1/4 | db | 90 | 10.10.40.1/24 |

- `route outside 0.0.0.0 0.0.0.0 198.51.100.1`
- NAT: separate NAT-MGMT/NAT-WEB/NAT-APP/NAT-SVC /24 objects dynamically PAT the four actual inside subnets to the outside interface. DMZ-WEB static 198.51.100.10; DMZ-DNS static 198.51.100.11. There is no DB-to-outside PAT; new DB Internet egress is denied.
- OUTSIDE_IN baseline: public TCP web and UDP/TCP DNS permits; explicit ICMP echo-reply exceptions to inside/DMZ prefixes for the simulator; implicit deny otherwise. Echo-reply exceptions are stateless header matches, not proof of connection-state filtering. Temporary TCP return diagnostics must be removed or explicitly justified in the final export.
- DMZ_IN: explicit ICMP echo-replies to 10.10.0.0/16; permit UDP syslog to 10.10.50.20; deny other DMZ → 10.10.0.0/16 and 10.255.0.0/16; permit DMZ → other destinations. Reply exceptions are header matches, not session-state checks.
- INSIDE_IN: allow APP (30), MGMT (10), SERVICES (50) to DB (40); deny other sources to DB; permit other destinations.
- DB_IN: explicit ICMP echo-reply exception; allow DB UDP DNS to 10.10.50.10, syslog/NTP to 10.10.50.20; deny other DB egress. New DB Internet egress is denied. Permitted TCP response handling requires the observed D19 test; the ICMP reply exception is explicit and must not be described as a session-state check.
- Global policy: inspect icmp, dns, http (the PT default `inspection_default` class also inspects ftp and tftp).

## 7. Security / services baseline
IOS devices: SSHv2 (RSA 1024 for this simulator), local user `netadmin` priv 15, VTY `access-class` from 10.10.10.0/24, exec-timeout, MOTD banner,
`service password-encryption`, no ip domain-lookup. VTY 0–4 are SSH-only with the access-class; VTY 5–15 have no password, so they refuse logins. NOC-PC manages the internal switches over SSH (verified to CORE-1 and ACC-1). SSH to DMZ-SW from inside was not verified and is expected to fail on the PT ASA's TCP return limitation, so use its console. External routers have no private management return path and use local simulator consoles.
CORE-1/2 and ACC-1/2 send syslog and use NTP at 10.10.50.20. Centralized TACACS+ with local fallback is an optional staged exercise, not part of the verified baseline.
Access ports: portfast + BPDU guard + port-security (max 2, sticky, restrict). DHCP snooping on ACC-1/ACC-2 VLAN 10 (uplinks trusted).
Rapid-PVST. Database segmentation is enforced at FW-1 with INSIDE_IN and DB_IN, not a core SVI ACL. The earlier DB-PROTECT plan was retired after the negative flow test exposed ineffective SVI ACL binding in the simulator.

## 8. Known Packet Tracer limits (do not claim as working)
No VXLAN/EVPN, no vPC/MLAG, no ASA failover pair in this lab. FW-1 and EDGE-R1 remain single points of failure. ACC-1 is the one inside firewall attachment switch, ACC-2 the one database attachment switch, and DMZ-SW the one DMZ switch. Shared service hosts are also single instances.
After Change 2, either core can fail without physically disconnecting the firewall's inside or database interface; convergence and restoration must be verified by the revised power-failure drills. This is core/path redundancy, not full-site HA.

## 9. Change log

### Change 1 — DB tier moved behind FW-1 as its own security zone (2026-10-24)
**Why:** Verified in PT 9.0 that the 3560-24PS accepts `ip access-group` on SVIs (named, numbered, in and out) but never
installs it effectively in the chosen model (absent from running-config, `show ip interface` = "not set", WEB-01 → DB-01 ping succeeded). VACLs
(`vlan access-map`) are rejected. This lab therefore uses ASA enforcement.
**New design:**
- New cable **L26: FW-1 Gi1/4 ↔ CORE-2 Fa0/24** (copper straight). CORE-2 Fa0/24 = access VLAN 40, portfast, "FW-1-DB-ZONE".
- CORE-1/CORE-2: `no interface Vlan40` (HSRP group 40 removed), DB-PROTECT ACL removed. VLAN 40 remains a Layer-2 VLAN on all trunks (STP root still CORE-2).
- FW-1 Gi1/4: `nameif db`, security-level 90, 10.10.40.1/24 (DB default gateway unchanged for hosts). OSPF advertises 10.10.40.0/24 to the cores.
- `INSIDE_IN` (in on inside): permit APP 10.10.30.0/24, MGMT 10.10.10.0/24, SERVICES 10.10.50.0/24 → DB; deny any → DB; permit everything else.
- Final `DB_IN` (in on db): explicit ICMP echo-replies; DB → SVC-DNS udp/53, SVC-MON udp/514 + udp/123; deny other egress, including Internet. The initial DB PAT experiment was removed.
- Source of the final policy repair: `automation/pt-adjusted/FW-1-db-zone-v2.cfg`; core changes in `automation/db_zone.js`. Reconciled baseline files are in `lab-support/configs/`.
- Trade-off: DB reachability now also depends on FW-1 and CORE-2 Fa0/24 (documented SPOF, no ASA HA pair in PT).

### Simulator behaviours observed (not design changes)
- `logging trap informational` and `logging source-interface` rejected on PT 3560/2960 → `logging trap debugging` accepted.
- `terminal length 0` rejected on PT switches; ASA `exit` from object-network mode drops to privileged EXEC (use `end` + `configure terminal`).
- LACP Po1 only bundles cleanly when both cores boot with the final config (power-cycle from startup-config) → Po1(SU), Gi0/1(P) Gi0/2(P).
- PT ASA does not persist `no shutdown` in startup-config: after a device power-cycle FW-1 data interfaces return admin-down and must be re-enabled. Saved .pkt preserves running state.
- PT creates two automatic "Power Distribution Device" objects (physical view); inventory count 24 = 22 logical network nodes + 2 power objects. Change 1 added one cable and no network node.
- Proxy ARP remained enabled after the CLI command. Supported model API setters changed FW-1 Gi1/2 and Gi1/4 to false; the DB peer test then passed. The flag is not saved in the `.pkt`, so the final file embeds `lab-support/model-workarounds.js` as its File Script Module (Change 4). CLI files alone do not reproduce this model-specific repair.

### Change 2 — Firewall attachments moved behind dual-homed ToRs

The initial direct core attachments caused avoidable zone outages when their attached core failed. L7 now terminates on ACC-1 Fa0/24 (VLAN900); L26 on ACC-2 Fa0/24 (VLAN40). VLAN900 is carried across all core/ToR trunks. Both old core Fa0/24 ports are parked. This revision temporarily used four ASA inside /24 static routes through the transit HSRP VIP. Those routes were superseded by Change 3. Source: `automation/rewire_fw.js`.

### Change 3 — Faster OSPF return-path recovery

The static VIP return-route experiment showed stale ARP behavior after CORE-1 failed. `automation/ospf_fast.js` removes those four ASA statics, configures matching 1/3 OSPF timers on transit interfaces and disables core transit proxy ARP. CORE-2 retains passive-SVI cost 100. F05_v3 recorded all five permitted test streams recovering at 43/50 each; the fault-time empty routing-table capture was transient. F03_v3 (CORE-2 off) then delivered 222/250 with 0 Internet loss, and a healthy baseline was captured after restore. Source configs reflect this revision.

### Change 4 — Self-contained final file, ARP flush and HSRP timer correction

- **Embedded fix module.** The final `.pkt` has exactly one File Script Module script, `lab-support/model-workarounds.js` v1.1. It runs on open, sets FW-1 Gi1/2 and Gi1/4 proxy ARP to false and runs `arp -d` on DB-01 and DB-02. Its permissions are IPC + Get/Change Network Info only. The file still opens if the user declines (the DB same-VLAN test may then fail). The build runner (`automation/runner.js`) and all diagnostic scripts were removed from the file.
- **Why the ARP flush.** With v1.0 (proxy-ARP flag only), the first reopen failed DB-01 → DB-02. DB-01 held DB-02's IP mapped to the ASA db MAC from before the fix applied. After `arp -d`, the ping passed and resolved DB-02's real MAC. With v1.1, a clean reopen passed the manual DB-01 → DB-02 test before any other action. The full 12/12 suite also passed after that reopen; the automated run used a temporary, unsaved runner and one module restart (RESULTS.md §3).
- **HSRP timers.** `hsrp_probe.js` showed that `standby 10 timers 1 3` takes effect at runtime (show standby: hello 1 / hold 3) but is written to the running-config as `standby 0 timers 1 3`. The setting is therefore lost on reload or file reopen. The final lab runs default 3/10 s, and the canvas caption was corrected. Source configs keep the intended `timers 1 3` lines; they apply until the next reload.
- **TCP return diagnostics removed.** The temporary scoped TCP-return permits used to diagnose D08/D19 were removed from FW-1 (`automation/pt-adjusted/FW-1-final-remove-tcp-return.cfg`). The final ACLs match `lab-support/configs/FW-1.cfg`.
- **Final evidence.** `lab-support/evidence/RESULTS.md`; as-built configs in `lab-support/evidence/final-running-configs/`.
