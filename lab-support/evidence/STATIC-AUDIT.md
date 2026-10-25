# Static source audit and as-built cross-check

**PASS**, 2026-10-24. Updated after Change 3 (OSPF return path) and Change 4 (final file).

## Source consistency

- All 26 cable rows match topology-handoff.md and lab-manifest.json.
- All 40 configured-device cable endpoints exist and are enabled; none is reused.
- Freed core Fa0/24 ports are parked/shut. ACC-1/ACC-2 Fa0/24 carry inside/db.
- Both cores have no database SVI/HSRP; FW-1 owns the database gateway.
- FW-1 has no inside static routes; it learns the four inside /24s by OSPF. Transit OSPF
  hello/dead is 1/3 s on both core Vlan900 SVIs and on ASA Gi1/2.
- PAT uses four inside /24 objects, with no DB egress PAT.
- Original DataCenter.pkt matches its backup byte for byte.

## Source vs. final running configuration (all 10 devices)

The 1,340 configuration lines in `../configs/*.cfg` were compared with
`final-running-configs/*.running-config.txt`, taking each line's interface or section into
account. Every difference falls into one of these groups:

| Difference | Explanation | Impact |
| --- | --- | --- |
| `no shutdown`, `standby <g> priority 100`, `line console 0` spelling | IOS hides defaults and abbreviates (`line con 0`) | none |
| `spanning-tree vlan N priority P` | IOS merges them (`spanning-tree vlan 10,30,50,900 priority 4096`) | none |
| BGP `network x mask 255.255.255.0` | Shown without mask for classful-boundary /24 | none |
| ASA `eq 80` / `eq 53`, `inspect dns` | Shown as `eq www` / `eq domain`, `inspect dns preset_dns_map` | none |
| **`standby <g> timers 1 3` missing on both cores** | PT 9 3560 bug: runtime applies it but saves it as `standby 0 timers 1 3`, lost at reload | **real**: saved lab runs default HSRP 3/10 s (RESULTS.md §4 L4) |

FW-1 access lists, access groups, NAT objects, routes and OSPF statements match the source
line for line. No TCP-return diagnostic permits remain.

The first ACC-1 export was missing its top lines (console buffer trimming). It was
re-captured page by page; the rebuilt file is 5,440 bytes against the device's own
`Current configuration : 5439 bytes` (the extra byte is the trailing newline).
