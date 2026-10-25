# Automation: Packet Tracer IPC scripts

These scripts built, configured, tested and audited the lab through Packet Tracer 9.0's
JavaScript scripting engine (Extensions → Scripting). They are kept as a record of how the
lab was produced. **None of them run from the final `Advanced-DataCenter.pkt`.** The only
script embedded in the final file is [`../lab-support/model-workarounds.js`](../lab-support/model-workarounds.js).

## How the runner works

A Packet Tracer script module was loaded with [`runner.js`](runner.js), which reads and runs
[`task.js`](task.js) from this folder. Each step was performed by rewriting `task.js` (for
example `DRILL = "F03"; STEP = "fault"; runFromDisk("automation/drill.js");`) and pressing
**Run File**. Steps are reproducible and every step writes a log to `logs/` or evidence to
`../lab-support/evidence/raw/`. `task.js` is left idle.

The scripts contain absolute paths to the author's machine (`BASE` in `lib.js` / `runner.js`).
Change them before re-using the scripts elsewhere.

## Key scripts

| Script | Purpose |
| --- | --- |
| `lib.js`, `cli.js` | Shared helpers: workspace/network handles, file I/O, console login/enable handling, paging through `--More--`, command output capture |
| `build_topology.js` | Creates the 22 devices and the original 25 cables with exact interfaces; L26 and the firewall re-cabling were added later by `db_zone.js` / `rewire_fw.js` |
| `apply_configs.js`, `asa_cfg.js` | Push `lab-support/configs/*.cfg` and ASA adjustments line by line, flagging any rejected command |
| `services.js`, `dhcp.js` | Configure DNS, DHCP pools, HTTP pages, syslog and NTP on the servers |
| `db_zone.js`, `rewire_fw.js`, `ospf_fast.js` | Design Changes 1–3 (DB zone behind the ASA, firewall links onto the ToRs, OSPF return path) |
| `hsrp_tune.js`, `hsrp_probe.js` | HSRP timer change and the probe that showed PT saves it as `standby 0 timers` |
| `fw_proxyarp.js`, `pa_check.js` | ASA proxy-ARP flag fix and read-back |
| `hosttest.js` + `tests/*.js` | Start parallel host pings, then collect PASS/FAIL with sent/received counts |
| `drills.js`, `drill.js` | Failure drills F01–F05: start streams, inject the fault, capture show commands, restore, verify |
| `export_configs.js`, `export_fix.js` | Export `show running-config` from all 10 devices (page-by-page capture for long output) |
| `post_reopen*.js` | Persistence audit after reopening the saved file |
| `layout.js` | Canvas captions and coloured zone boxes |
| `pt-adjusted/` | ASA config fragments applied during troubleshooting (including the removed TCP-return diagnostics) |
| `logs/` | Every script's log, plus CLI transcripts from the first config push |

Early probe and diagnostic scripts (`probe*.js`, `acl_probe*.js`, `db_fix*.js`, `fix_po1*.js`,
`l2_step*.js`) document the troubleshooting path. Several reflect earlier designs and are not
needed to rebuild the final lab.
