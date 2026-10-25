STREAMS = [
  {id: "R4-app-db",    src: "APP-01",  cmd: "ping -n 6 10.10.40.12",  expect: "permit"},
  {id: "R4-web-db",    src: "WEB-01",  cmd: "ping -n 6 10.10.40.11",  expect: "deny"},
  {id: "R4-svc-inet",  src: "SVC-MON", cmd: "ping -n 6 203.0.113.10", expect: "permit"},
  {id: "R4-dmz-inet",  src: "DMZ-DNS", cmd: "ping -n 6 203.0.113.10", expect: "permit"},
  {id: "R4-noc-dmz",   src: "NOC-PC",  cmd: "ping -n 6 172.16.50.10", expect: "permit"},
  {id: "R4-db-db",     src: "DB-01",   cmd: "ping -n 6 10.10.40.12",  expect: "permit"},
  {id: "R4-inet-pub",  src: "INET-SRV",cmd: "ping -n 6 198.51.100.10",expect: "deny"},
  {id: "R4-dmz-mgmt",  src: "DMZ-WEB", cmd: "ping -n 6 10.10.10.2",   expect: "deny"},
  {id: "R4-web-app",   src: "WEB-02",  cmd: "ping -n 6 10.10.30.11",  expect: "permit"},
  {id: "R4-svc-db",    src: "SVC-DNS", cmd: "ping -n 6 10.10.40.11",  expect: "permit"},
  {id: "R4-db-noinet", src: "DB-02",   cmd: "ping -n 6 203.0.113.10", expect: "deny"}
];
TEST_TAG = (typeof R4TAG !== "undefined") ? R4TAG : "round4_after_rewire";
