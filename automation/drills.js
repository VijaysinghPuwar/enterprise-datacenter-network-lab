// Stress / failover drill definitions. Each drill: concurrent ping streams, a fault, a restore, and show captures.
var STREAMS_ALL = {
  S1:  {src: "NOC-PC",  dst: "10.10.20.11",  expect: "permit", desc: "MGMT -> WEB-01 (routed, HSRP)"},
  S2:  {src: "APP-02",  dst: "10.10.20.12",  expect: "permit", desc: "APP -> WEB-02 (routed, cross-rack)"},
  S3:  {src: "APP-01",  dst: "10.10.40.12",  expect: "permit", desc: "APP -> DB-02 (through FW-1 db zone)"},
  S4:  {src: "WEB-01",  dst: "10.10.40.11",  expect: "deny",   desc: "WEB -> DB-01 (blocked by INSIDE_IN)"},
  S5:  {src: "SVC-MON", dst: "203.0.113.10", expect: "permit", desc: "SERVICES -> Internet (PAT + BGP)"},
  S6:  {src: "SVC-DNS", dst: "10.10.40.11",  expect: "permit", desc: "SERVICES -> DB-01 (through FW-1)"},
  S7:  {src: "DMZ-DNS", dst: "203.0.113.10", expect: "permit", desc: "DMZ -> Internet (static NAT)"},
  S8:  {src: "INET-SRV",dst: "198.51.100.10",expect: "deny",   desc: "Internet ICMP -> public web (blocked)"},
  S9:  {src: "DB-01",   dst: "10.10.40.12",  expect: "permit", desc: "DB-01 -> DB-02 (L2 cross-rack VLAN 40)"},
  S10: {src: "WEB-02",  dst: "10.10.30.11",  expect: "permit", desc: "WEB -> APP-01 (routed, cross-rack)"},
  S11: {src: "DMZ-WEB", dst: "10.10.10.2",   expect: "deny",   desc: "DMZ -> core mgmt (blocked by DMZ_IN)"}
};
var DRILLS = {
  S0: {count: 30, streams: ["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10","S11"], fault: [], restore: [], shows: []},
  F01: {count: 40, streams: ["S1","S2","S3","S5","S9","S10"],
        fault:   [["CORE-1", ["configure terminal", "interface GigabitEthernet0/1", "shutdown", "end"]]],
        restore: [["CORE-1", ["configure terminal", "interface GigabitEthernet0/1", "no shutdown", "end"]]],
        shows:   [["CORE-1", "show etherchannel summary"], ["CORE-2", "show etherchannel summary"]]},
  F02: {count: 40, streams: ["S1","S3","S5","S6","S10"],
        fault:   [["ACC-1", ["configure terminal", "interface GigabitEthernet0/1", "shutdown", "end"]]],
        restore: [["ACC-1", ["configure terminal", "interface GigabitEthernet0/1", "no shutdown", "end"]]],
        shows:   [["ACC-1", "show spanning-tree vlan 10"], ["ACC-1", "show spanning-tree vlan 30"], ["ACC-1", "show interfaces trunk"]]},
  F03: {count: 50, streams: ["S1","S2","S3","S5","S10"],
        fault:   [["POWER", "CORE-2", false]],
        restore: [["POWER", "CORE-2", true]],
        shows:   [["CORE-1", "show standby brief"], ["CORE-1", "show ip ospf neighbor"], ["CORE-1", "show etherchannel summary"], ["FW-1", "show route"]]},
  F04: {count: 50, streams: ["S5","S7","S1"],
        fault:   [["EDGE-R1", ["configure terminal", "interface GigabitEthernet0/0/1", "shutdown", "end"]]],
        restore: [["EDGE-R1", ["configure terminal", "interface GigabitEthernet0/0/1", "no shutdown", "end"]]],
        shows:   [["EDGE-R1", "show ip bgp summary"], ["EDGE-R1", "show ip bgp"], ["INET-R", "show ip bgp"]]},
  F05: {count: 50, streams: ["S1","S2","S3","S5","S10"],
        fault:   [["POWER", "CORE-1", false]],
        restore: [["POWER", "CORE-1", true]],
        shows:   [["CORE-2", "show standby brief"], ["CORE-2", "show ip ospf neighbor"], ["CORE-2", "show ip route"], ["FW-1", "show route"]]}
};
