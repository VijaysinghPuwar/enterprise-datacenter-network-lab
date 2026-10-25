# Applying the lab configurations

The topology and port assignments are in `../topology-handoff.md`. Apply each
matching file from `configs/` to a fresh simulated device; do not paste one
device's config into a different model or port layout. The files configure the
network and save startup configuration; they do not create devices or cables.

Recommended order: cores, access switches, router fabric, ASA, endpoint
addressing, then server services. Allow Layer 2 and routing convergence before
testing. At a fresh router's initial configuration dialog answer `no` and press
Enter to obtain the CLI prompt before pasting its file.

After the ASA CLI config, apply the proxy-ARP model workaround described below.
The ten CLI files alone do not reproduce that simulator-specific flag repair.

For a fresh ASA, enter `enable` interactively and press Enter for its blank
default enable password. Then paste from the file's `configure terminal` line.
If using the scripting API, enter configuration mode through its explicit
`enable` mode rather than feeding a password prompt with the next config line.

All credentials are public lab placeholders: local user `netadmin`, password
and enable secret `DcLabOnly2026!`. The RSA 1024 setting follows the selected
simulator command set and is not a recommendation for real device deployment.

Stop on `% Invalid`, `% Incomplete`, `% Ambiguous` or unimplemented commands.
Repair the affected command for the actual model and record the change. An RSA
key replacement prompt requires handling interactively if a device already has
keys. Do not paste these files repeatedly into an already configured topology
without inspecting the resulting state.

## Optional centralized AAA (internal switches only)

First prove local SSH from NOC-PC works. On SVC-MON enable AAA, create a TACACS+
user `netadmin` with the lab password, and register clients with shared key
`DcTacacsLab2026`. Use each device's observed source address in the client list.
Set `ip tacacs source-interface Vlan10` only if the simulated model accepts it;
otherwise capture the actual server-facing source and register that address.

Apply to one device at a time with its simulator console left available:

```text
configure terminal
aaa new-model
tacacs-server host 10.10.50.20
tacacs-server key DcTacacsLab2026
aaa authentication login SSH-AUTH group tacacs+ local
line vty 0 4
login authentication SSH-AUTH
end
write memory
```

Test both successful centralized login and local login during a server timeout.
An explicit server denial is not a timeout and does not trigger local fallback.
Do not mark AAA implemented until both tests have evidence.

## ASA static routing fallback

Use only if a different simulated ASA cannot establish the intended OSPF
adjacency. On FW-1 retain the four inside /24 routes through 10.255.0.1 and the
outside default, and remove its unsupported OSPF process. On each core add:

```text
ip route 0.0.0.0 0.0.0.0 10.255.0.4
ip route 10.10.40.0 255.255.255.0 10.255.0.4
```

Keep OSPF between the cores on VLAN900 and record that ASA default/database
advertisements were replaced with static routes. Save and repeat tests.

## Management boundary

NOC-PC manages the internal switches over SSH through routed private addressing
(verified to CORE-1 and ACC-1). SSH from inside to DMZ-SW crosses the ASA and was
not verified; with the PT ASA's TCP return limitation it is expected to fail, so
use DMZ-SW's console.
The ISP/Internet routers and EDGE-R1 use their local simulator consoles. This
topology does not provide an out-of-band management network or a routed private
management path through the ASA to the external routers.

## BGP policy boundary

The installed ISR4331 command reference lists basic BGP only. Baseline configs
therefore omit route maps, prefix lists and neighbor weight. The edge locally
originates its public /24, but learned BGP routes can still be re-advertised.
Non-transit route filtering and deterministic BGP preference are not implemented.
The preferred static default and floating backup are separate from the BGP
best path for the advertised Internet subnet. Treat this as an isolated routing
exercise; production multihoming requires enforceable routing policy.

## Restart behavior observed during construction

After a lab-wide simulated power cycle, the rebuilt LACP bundle and expected
STP roots converged correctly. FW-1 retained its configured interface addresses
but its used interfaces came back administratively down. They were
re-enabled explicitly. If this simulator behavior recurs after a power cycle,
use the FW-1 console and verify the result:

```text
enable
configure terminal
interface GigabitEthernet1/1
no shutdown
interface GigabitEthernet1/2
no shutdown
interface GigabitEthernet1/3
no shutdown
interface GigabitEthernet1/4
no shutdown
end
write memory
show interface ip brief
```

Supply the lab enable password when prompted. Wait for OSPF and test public
and internal traffic again. Do not count a manual interface restoration as
automatic recovery. Opening the saved `.pkt` is different from a device power
cycle: the final file was reopened twice and all four FW-1 data interfaces came
up with their addresses (evidence/raw/reopen/).

## Database security zone

The final database gateway is FW-1 Gi1/4 at 10.10.40.1/24, connected to
ACC-2 Fa0/24 in access VLAN 40. Both cores bridge this VLAN without an SVI or
HSRP group. OSPF advertises the database subnet from FW-1. INSIDE_IN permits
APP/MGMT/SERVICES sources to DB and denies other sources. DB_IN restricts new
connections initiated by DB while allowing its specified UDP DNS, NTP and
syslog traffic. DB has no Internet PAT/egress permission. The policy includes
an explicit ICMP echo-reply exception to support permitted inbound ping tests;
that exception is not a session-state check. Verify actual TCP response
handling with an allowed HTTP test. `passive-interface db` was rejected and
is omitted from the baseline source.

This replaces the original DB-PROTECT SVI ACL plan after live tests found
ineffective SVI ACL bindings in the selected simulated 3560 model. The database
attachment remains live through either core because ACC-2 has two uplinks.

## Core/path resilience revision

FW-1 inside attaches to ACC-1 Fa0/24 in VLAN900, and its database zone attaches
to ACC-2 Fa0/24 in VLAN40. All core/ToR trunks carry VLAN900; unused core Fa0/24
ports are shut. FW-1 learns the four inside /24 subnets from the cores over OSPF
(Change 3; the earlier static routes through transit VIP 10.255.0.1 were removed).
Transit OSPF uses hello/dead 1/3 s on both core Vlan900 SVIs and ASA Gi1/2, and
the transit SVIs use `no ip proxy-arp`. CORE-2 server SVI OSPF cost is 100, so the
ASA prefers CORE-1 and fails over to CORE-2 when CORE-1 is lost.

**HSRP timer model bug.** `standby <group> timers 1 3` is accepted and takes effect
at runtime, but the PT 9 3560 writes it to the running-config as
`standby 0 timers 1 3`. After any reload or file reopen the groups fall back to
the default hello 3 s / hold 10 s. The saved lab therefore runs 3/10 s. To try
fast timers in a session, re-enter the command on both cores (it lasts until the
next reload). Evidence: `../automation/logs/hsrp_probe.log`,
`evidence/raw/tests/show_hsrp_detail_final.txt`.

PAT uses four actual inside /24 objects, excluding the database zone. The
baseline includes explicit outside and DMZ ICMP echo-reply exceptions for this
simulator. Do not interpret these stateless header matches as full connection
state enforcement. The temporary TCP-return diagnostics were removed before the
final export; the final FW-1 ACLs match `configs/FW-1.cfg` line for line.

## Required proxy-ARP model workaround

The CLI `sysopt noproxyarp db` did not change the modeled port flag. A readback
through the supported extensions API showed proxy ARP still enabled. The same
API successfully disabled it on FW-1 Gi1/2 (inside) and Gi1/4 (db), after which
the database peer test passed. The tested calls are in `model-workarounds.js`.

**Final state (verified).** The flag is not saved in the `.pkt`; every reopen
showed `true` again. The final `Advanced-DataCenter.pkt` therefore embeds
`model-workarounds.js` v1.1 as its only File Script Module script (startup
"On Startup"; permissions IPC, Get Network Info, Change Network Info; "allow
opening file even if security privileges are not granted" enabled). On open,
Packet Tracer shows a permission prompt with the script description. The script
then:

1. sets proxy ARP to false on FW-1 Gi1/2 and Gi1/4, and
2. runs `arp -d` on DB-01 and DB-02, so no entry learned before step 1 survives.
   Without this flush, the first reopen test failed DB-01 → DB-02 on a stale ARP entry.

It doesn't load files, change topology or contact anything external. The
build runner and diagnostic scripts are not in the file. Evidence:
`evidence/RESULTS.md` §3.

For a fresh rebuild, apply the CLI configs first, then add `model-workarounds.js`
as the File Script Module (Extensions → Scripting → Edit File Script Module →
Script Engine → Import), enable the three permissions above, start it and save.
