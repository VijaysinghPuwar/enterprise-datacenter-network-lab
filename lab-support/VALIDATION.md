# Advanced data center acceptance tests

Record observations from the saved Packet Tracer file in `evidence/RESULTS.md`.
The presence of configuration files is not proof that the running lab passes.
Run normal-operation tests before failure exercises. Restore each fault before
introducing the next one, and save the healthy topology after all repairs.

## Baseline evidence

On every IOS router and multilayer switch, capture:

```text
show version
show ip interface brief
show running-config
show ip route
show ip ospf neighbor
```

On Layer 2 and multilayer switches, also capture:

```text
show vlan brief
show interfaces trunk
show etherchannel summary
show spanning-tree
```

On the two gateway switches, capture:

```text
show standby brief
show access-lists
```

Use the command help (`?`) if a specific simulated model does not implement a
command. Record that limitation explicitly instead of treating it as a pass.

## Acceptance matrix

| ID | Check | Expected observation |
| --- | --- | --- |
| B01 | Physical cabling | Each cable and interface matches the final port map. Router interfaces are enabled. |
| B02 | VLANs and trunks | Required VLANs exist at both ends; native and allowed VLAN lists match. |
| B03 | EtherChannel | Every intended member is bundled; no suspended member; one bundle terminates on exactly two switches. |
| B04 | Spanning tree | One root per VLAN; standby root is predictable; redundant non-bundled Layer 2 paths have a discarding port where required. |
| B05 | Gateway redundancy | Exactly one HSRP active and one standby for VLANs 10/20/30/50/900; database VLAN 40 uses its ASA gateway. |
| B06 | OSPF | Intended routed adjacencies reach FULL; server and user interfaces are passive. |
| B07 | Routing | Every required subnet has a route and a return path. Default routes exist only where designed. |
| B08 | Host addressing | IP, mask, gateway and DNS match the address plan; reserved addresses are outside DHCP pools. |
| B09 | Name resolution | A client resolves the internal web name to the configured server address. |
| B10 | Application | A permitted client opens the HTTP page by both IP and DNS name. |
| B11 | Segmentation | An allowed flow succeeds and a prohibited flow fails; ACL counters increase on the expected rule. |
| B12 | Device management | The management client can use SSH to devices; an untrusted client cannot. |
| B13 | External connectivity | A permitted internal host reaches the simulated external service; NAT evidence matches the host if NAT is implemented. |
| B14 | Persistence | Running configurations are saved; reopening the final file preserves addressing and behavior. |

ARP resolution and routing/STP convergence can lose initial packets. Repeat a
test after convergence, and record the steady-state result. A green link alone
does not demonstrate end-to-end connectivity.

## Failure exercises

Perform these only inside the simulator, from a saved healthy baseline.

1. **One EtherChannel member fails.** Shut one member interface on one endpoint.
   The port-channel should stay up and the test flow should recover or continue.
   Restore the member and confirm it rejoins the bundle.
2. **One access uplink fails.** Shut the forwarding uplink or its entire bundle.
   The alternative uplink should forward after STP convergence. Check the new
   spanning-tree port roles and restore the original uplink.
3. **The active first-hop gateway fails.** Turn off the active gateway device.
   The surviving gateway should become active for the affected HSRP groups.
   Confirm a server on the surviving path remains reachable through the virtual
   gateway. Restore the device and observe preemption where configured.
4. **One routed core-to-edge path fails.** Shut one routed interface. Verify the
   affected adjacency disappears and OSPF selects the remaining route. Check
   both outbound and return traffic, then restore the link.
5. **An upstream link fails.** If two usable upstream paths are actually
   configured, fail the preferred link and confirm external traffic recovers.
   Existing NAT sessions need not survive a change of translating router.
6. **A server access port is assigned the wrong VLAN.** Record the original
   VLAN, move the port to the unused parking VLAN, and diagnose the failure
   from `show vlan brief`, host addressing and gateway reachability. Restore it.
7. **A service is unavailable.** Turn off HTTP or DNS on its simulated server.
   Distinguish service failure from network failure using ping, DNS lookup and
   the web client. Restore the service.
8. **A forbidden flow is attempted.** Test a DMZ/client-to-management or
   DMZ/client-to-database flow that policy explicitly prohibits. Capture the
   deny rule counter. Do not weaken the policy merely to make every ping pass.

## Concrete tests for the DC1 topology

| ID | Source | Action | Expected result |
| --- | --- | --- | --- |
| D01 | NOC-PC | Select DHCP, then `ipconfig /all` | One unique lease in 10.10.10.100–149, /24, gateway 10.10.10.1, DNS 10.10.50.10. |
| D02 | NOC-PC | `ping 10.10.20.11`, `ping 10.10.20.12` | Both rack web endpoints respond after convergence. |
| D03 | NOC-PC | Browser: `http://web.dc1.lab` | WEB-01 identity page, using internal DNS. |
| D04 | APP-01 | `ping 10.10.40.11` and `ping 10.10.40.12` | Both DB-tier endpoints respond; permitted source VLAN 30. |
| D05 | WEB-01 | `ping 10.10.40.11` | Denied. INSIDE_IN deny counter increases on FW-1. |
| D06 | NOC-PC | `ssh -l netadmin 10.10.10.2`, then .3, .11, .12 | Internal device management succeeds using the lab password. |
| D07 | WEB-01 | `ssh -l netadmin 10.10.10.11` | Denied by MGMT-SSH. |
| D08 | NOC-PC | Browser: `http://www.internet.example` | INET-SRV identity page. On FW-1, `show xlate` / `show nat` provides PAT evidence. |
| D09 | INET-SRV | Browser: `http://198.51.100.10` | DMZ-WEB identity page through static NAT and OUTSIDE_IN. |
| D10 | INET-SRV | Temporarily use DNS 198.51.100.11; resolve `www.dc1-corp.com` | Public DNS returns 198.51.100.10. Record the separate browser result under D09; DNS success does not prove HTTP access. Restore original DNS afterward. |
| D11 | DMZ-WEB | `ping 10.10.10.2` and `ping 10.255.0.2` | Both denied by DMZ_IN. |
| D12 | INET-SRV | `ping 198.51.100.10` | Denied by outside policy. This is an expected negative test. |
| D13 | EDGE-R1 | `show ip bgp summary`, `show ip route 203.0.113.0` | Two established eBGP neighbors; a usable Internet subnet route. Record the actual best path. |
| D14 | CORE-1/2 and FW-1 | `show ip ospf neighbor` / `show route` on ASA | Three OSPF speakers share transit VLAN 900. A core normally has two FULL neighbors and an OSPF default from FW-1. |
| D15 | CORE-1/2 | `show standby brief` | CORE-1 active for 10/30/50/900; CORE-2 active for 20. No VLAN 40 HSRP group. |
| D16 | DB-01 | `ping 10.10.30.11` | New DB-to-APP traffic denied by DB_IN; paired APP-to-DB D04 still succeeds. |
| D17 | DB-01 | Resolve `web.dc1.lab` using 10.10.50.10 | UDP DNS exception works even though a new DB-to-web connection is denied. |
| D18 | Both cores | `show ip route` | Database 10.10.40.0/24 is learned through FW-1, not connected to a core SVI. |
| D19 | APP-01 | Browser: `http://10.10.40.11` | DB-01's network-test identity page over permitted TCP through the ASA, with no NAT. Distinguishes TCP/connection handling from the separate NAT HTTP tests; does not represent a SQL/application runtime. |

For client DNS troubleshooting, use `nslookup` if its simulated command prompt
supports it. Otherwise inspect the DNS events in Simulation Mode and record
the returned address. Do not replace an unverified DNS result with a direct-IP
browser result.

### Exact fault/restore commands

These are local simulator console commands. Capture the healthy state first.
Enter `configure terminal`, then the interface commands below, then `end`.

| Exercise | Device / fault | Restore | Verification |
| --- | --- | --- | --- |
| F01 | CORE-1: `interface GigabitEthernet0/1`, `shutdown` | Same interface: `no shutdown` | Po1 stays up with Gi0/2 bundled. D02/D03 recover or remain reachable. |
| F02 | ACC-1: `interface GigabitEthernet0/1`, `shutdown` | Same interface: `no shutdown` | VLAN 10 reaches its root over Gi0/2 after convergence; NOC-PC retains service access. |
| F03 | Turn off CORE-2 in Physical tab | Turn CORE-2 on | CORE-1 becomes HSRP active for VLAN20. Web, database and previously passing external flows should recover through CORE-1; both ASA zone links stay physically live on their ToRs. Restore and verify preemption, bundle membership and all flows. |
| F04 | EDGE-R1: fail the observed best BGP path; first baseline used ISP2, so `interface GigabitEthernet0/0/1`, `shutdown` | Same interface: `no shutdown` | ISP2 session drops; route to 203.0.113.0/24 changes to ISP1; D08/D09 recover. Recheck best path before repeating. |
| F05 | Turn off CORE-1 | Turn CORE-1 on | VLANs 10/30/50/900 move to CORE-2. All baseline passing permitted flows should recover; FW-1 return routes move from CORE-1 to CORE-2 by OSPF (CORE-2 SVI cost 100). Restore and verify expected preemption and steady-state connectivity. |

The access-switch uplinks are independent 100-Mbit core-facing links even
though access-side ports are GigabitEthernet. The inter-core bundle has two
GigabitEthernet members. Do not claim modern high-throughput data center
capacity from these simulated models.

## Repeated traffic and recovery workload

This is a functional stress exercise in the simulator, not a throughput or
hardware-capacity benchmark. First record the D01–D19 baseline outcomes and
identify the permitted flows that actually work. Compare failure/recovery
against those flows; an application that failed at baseline cannot demonstrate
availability during a fault. Keep the saved healthy file available, and run
only one failure at a time.

Use periodic complex ICMP PDUs or repeated client pings for these flows:

| Stream | Source → destination | Baseline policy |
| --- | --- | --- |
| S1 | NOC-PC → WEB-01 (10.10.20.11) | Permit |
| S2 | NOC-PC → WEB-02 (10.10.20.12) | Permit |
| S3 | APP-01 → DB-02 (10.10.40.12) | Permit |
| S4 | WEB-01 → DB-01 (10.10.40.11) | Deny throughout |
| S5 | NOC-PC → INET-SRV (203.0.113.10) | Permit through inside PAT and ICMP inspection |

Suggested workload: one packet per stream per simulated second, at least 30
attempts per stream at healthy baseline, then repeat during F01, F02, F03 and
F04 separately. Check HTTP and DNS again after each restoration. Repeat one
selected failure/restore cycle three times to catch inconsistent recovery.
After the firewall attachment revision, S3 should recover during either core
outage. Earlier F03 captures from the direct-core-attachment design document
an obsolete dependency and must be identified separately from final tests.

Record actual sent/success/failed counts if the simulator exposes them. Separate
initial ARP/convergence losses, losses while the fault is active, and results
after restoration. Record each deliberately denied S4 attempt as a policy pass,
not as an availability failure. Stop all periodic traffic before saving the
final clean lab so reopening does not start an unintended workload.

Include unfinished or cancelled streams explicitly. A subtotal containing only
completed streams is not an aggregate success rate. If a client reports more
replies than requests, retain the raw output and mark the count invalid for a
delivery percentage; investigate duplicate replies or console accounting and
repeat a clean warmed test. Never present a value over 100% as availability.

Use the simulator's event timestamps if reporting convergence observations.
State the configured timers and event method. Host-machine wall time and
Packet Tracer's simulated time are not interchangeable. Do not infer physical
network throughput or loss guarantees from these results.

## Troubleshooting sequence

1. Check the endpoint's IP, mask, default gateway and DNS settings.
2. Check access VLAN, link status, trunk VLAN list, STP and port-channel state.
3. Check SVI state and HSRP active/standby roles.
4. Check the routing table and the next-hop adjacency in both directions.
5. Check ACL placement, direction, rule order and counters.
6. Check server services, DNS records and NAT translations if applicable.

## Simulation boundaries

This is a network simulation. It does not establish real throughput, latency,
hardware resilience or production security. Packet Tracer implements a subset
of IOS and simplified protocol models. Features must be verified on the chosen
device model before they are counted as implemented.

Reference: [Cisco Packet Tracer FAQ](https://tutorials.ptnetacad.net/help/default/faqTroubleShoot.htm).
